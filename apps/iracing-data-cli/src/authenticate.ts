/**
 * CLI browser-flow and callback-listener owner.
 *
 * Bind the registered HTTP IPv4/IPv6 loopback host/path before opening authorization.
 * For a registered port-0 URI, replace only the port after listen; otherwise retain
 * the registered URI exactly for authorization and token exchange. Local config
 * cannot register a redirect URI upstream. One matching callback claims the flow;
 * wrong paths return 404 and subsequent callbacks return 409. Success, error,
 * callback timeout and SIGINT/SIGTERM all leave through listener/timer cleanup.
 *
 * The reusable OAuthClient owns PKCE/state consumption and protocol processing.
 * This CLI uses an explicit session key with in-memory stores, avoiding profile
 * lookup for auth-only scopes; login.ts subsequently persists the returned token.
 * Browser opener failure prints the authorization URL for manual completion, not
 * token values. Callback failure uses fixed HTML/diagnostics instead of raw causes.
 * A timeout/cancellation closes local work; it does not revoke upstream grants.
 */
import {
  createServer,
  type Server,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthScopeList,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { openUrlInBrowser } from "./browser.js";
import type { Diagnostics } from "./diagnostics.js";
import type { AddressInfo } from "node:net";

const CALLBACK_HOST = "127.0.0.1";

const CALLBACK_PATH = "/oauth/iracing/callback";

const DEFAULT_REDIRECT_URI = `http://${CALLBACK_HOST}:0${CALLBACK_PATH}`;

const SESSION_ID = "iracing-data-cli";

/** Authorization and profile permissions requested by default during CLI login. */
export const DEFAULT_SCOPES = [
  "iracing.auth",
  "iracing.profile",
] satisfies OAuthScopeList;

/**
 * Minimal OAuth lifecycle seam used by browser login so tests and alternate hosts can supply
 * the protocol owner without reproducing it.
 */
export interface OAuthClientLike {
  /**
   * Creates an authorization request and retains its state and PKCE verifier.
   * @returns {Promise<{ url: URL }>} Authorization URL with retained state and PKCE context.
   */
  authorize(): Promise<{ url: URL }>;

  /**
   * Exchanges the callback code and stores the resulting OAuth session.
   * @param {URLSearchParams} params - Query parameters received on the authorization callback.
   * @param {string} [sessionId] - Key identifying the stored OAuth session when provided; otherwise, the profile is fetched and its iRacing customer ID is used.
   * @returns {Promise<OAuthTokenResponse>} OAuth session obtained by exchanging the callback code.
   */
  callback(
    params: URLSearchParams,
    sessionId?: string,
  ): Promise<OAuthTokenResponse>;
}

/** Client registration inputs used only when browser login must construct its own OAuth client. */
export interface OAuthClientConfig {
  /** Identifier issued when registering the OAuth application. */
  clientId: string;

  /** Optional confidential-client secret used by supported grant flows. */
  clientSecret?: string;

  /** Registered callback URL for the authorization-code exchange. */
  redirectUri: string;

  /** Ordered OAuth permissions requested for authorization. */
  scopes: Readonly<OAuthScopeList>;
}

/** Process-signal seam used to cancel browser login while guaranteeing listener cleanup. */
export interface SignalSource {
  /**
   * Registers a one-time listener for a process signal.
   * @param {NodeJS.Signals} signal - Process signal name, such as SIGINT.
   * @param {() => void} listener - Callback invoked when the selected process signal fires.
   * @returns {unknown} Host-specific listener registration result.
   */
  once(signal: NodeJS.Signals, listener: () => void): unknown;

  /**
   * Removes a previously registered process-signal listener.
   * @param {NodeJS.Signals} signal - Process signal name, such as SIGINT.
   * @param {() => void} listener - Callback invoked when the selected process signal fires.
   * @returns {unknown} Host-specific listener removal result.
   */
  off(signal: NodeJS.Signals, listener: () => void): unknown;
}

/**
 * Browser-login dependencies and policy knobs; injected seams keep protocol, browser launch,
 * and cancellation testable.
 */
export interface BrowserLoginOptions {
  /** Identifier issued when registering the OAuth application. */
  clientId: string;

  /** Optional confidential-client secret used by supported grant flows. */
  clientSecret?: string;

  /** Registered callback URL for the authorization-code exchange. */
  redirectUri?: string;

  /** Ordered OAuth permissions requested for authorization. */
  scopes?: Readonly<OAuthScopeList>;

  /** Maximum time to wait for browser authorization before cancelling. */
  timeoutSeconds: number;

  /** Whether to launch the authorization URL in the default browser. */
  openBrowser: boolean;

  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /**
   * Injected browser launcher for the authorization URL.
   * @param {string} url - Absolute URL used by this operation.
   * @returns {Promise<void>} Completion of the requested operation.
   */
  browserOpener?: (url: string) => Promise<void>;

  /**
   * Constructs the OAuth lifecycle owner for the selected registration.
   * @param {OAuthClientConfig} config - Validated registration, transport, or verification settings.
   * @returns {OAuthClientLike} OAuth lifecycle owner configured for the selected registration.
   */
  clientFactory?: (config: OAuthClientConfig) => OAuthClientLike;

  /** Process-signal source used to cancel and clean up browser login. */
  signalSource?: SignalSource;
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();

      return;
    }

    server.close(() => {
      resolve();
    });
    server.closeAllConnections();
  });
}

/**
 * Runs one loopback browser authorization attempt, accepts at most one callback, and always
 * releases the listener and signal handlers.
 * @param {BrowserLoginOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<OAuthTokenResponse>} OAuth credentials obtained from the completed browser callback.
 */
export async function authenticateWithBrowser(
  options: BrowserLoginOptions,
): Promise<OAuthTokenResponse> {
  const { timeoutSeconds, diagnostics, signalSource = process } = options;

  const registeredRedirectUri = options.redirectUri ?? DEFAULT_REDIRECT_URI;

  const callbackUrl = validateBrowserOptions(options, registeredRedirectUri);

  const callbackHost = callbackUrl.hostname.replace(/^\[|\]$/g, "");

  const callbackPort = Number(callbackUrl.port || "80");

  const server = createServer();

  let timeout: NodeJS.Timeout | undefined;

  let rejectFlow: ((reason?: unknown) => void) | undefined;

  const onSignal = () => rejectFlow?.(new Error("Authentication cancelled."));

  try {
    await listenForCallback(server, callbackPort, callbackHost);

    const address = server.address() as AddressInfo | null;

    if (!address) {
      throw new Error("OAuth callback listener did not expose an address.");
    }

    const redirectUri =
      callbackPort === 0
        ? registeredRedirectUri.replace(
            /:0(?=\/|\?|$)/,
            `:${String(address.port)}`,
          )
        : registeredRedirectUri;

    const client = browserOAuthClient(options, redirectUri);

    const { url } = await client.authorize();

    const callbackPromise = new Promise<OAuthTokenResponse>(
      (resolve, reject) => {
        rejectFlow = reject;
        timeout = setTimeout(
          () => {
            reject(
              new Error(
                "Timed out waiting for the OAuth callback. If iRacing rejected the URL, check IRACING_AUTH_CLIENT and ensure IRACING_AUTH_REDIRECT_URI matches a registered redirect URI (use port 0 only for a registered native-app URI).",
              ),
            );
          },
          Math.round(timeoutSeconds * 1000),
        );
        signalSource.once("SIGINT", onSignal);
        signalSource.once("SIGTERM", onSignal);

        const handleRequest = callbackHandler(
          client,
          redirectUri,
          callbackUrl.pathname,
          { resolve, reject },
        );

        server.on("request", (request, response) => {
          void handleRequest(request, response).catch(reject);
        });
      },
    );

    await showAuthorizationUrl(url, options);

    diagnostics.info("Waiting for the OAuth callback...");

    return await callbackPromise;
  } finally {
    await cleanupBrowserListener(server, timeout, { signalSource, onSignal });
  }
}

function validateBrowserOptions(
  options: BrowserLoginOptions,
  registeredRedirectUri: string,
): URL {
  if (!options.clientId) {
    throw new Error(
      "Missing required environment variable: IRACING_AUTH_CLIENT",
    );
  }

  if (!Number.isFinite(options.timeoutSeconds) || options.timeoutSeconds <= 0) {
    throw new Error("--timeout-seconds must be a positive number");
  }

  let callbackUrl: URL;

  try {
    callbackUrl = new URL(registeredRedirectUri);
  } catch {
    throw new Error(
      "IRACING_AUTH_REDIRECT_URI must be a valid HTTP loopback URL.",
    );
  }

  if (
    callbackUrl.protocol !== "http:" ||
    !["127.0.0.1", "[::1]"].includes(callbackUrl.hostname) ||
    callbackUrl.username ||
    callbackUrl.password ||
    registeredRedirectUri.includes("#")
  ) {
    throw new Error(
      "IRACING_AUTH_REDIRECT_URI must use http://127.0.0.1 or http://[::1], without credentials or a fragment. Register this loopback URI with iRacing before using browser login.",
    );
  }

  return callbackUrl;
}

async function listenForCallback(
  server: Server,
  callbackPort: number,
  callbackHost: string,
) {
  await new Promise<void>((resolve, reject) => {
    server.once("error", () => {
      reject(
        new Error(
          "Could not bind the OAuth callback listener. Free the port configured by IRACING_AUTH_REDIRECT_URI, or configure another loopback URI registered with iRacing.",
        ),
      );
    });
    server.listen(callbackPort, callbackHost, () => {
      resolve();
    });
  });
}

async function showAuthorizationUrl(url: URL, options: BrowserLoginOptions) {
  const authorizationUrl = url.toString();

  if (options.openBrowser) {
    try {
      await (options.browserOpener ?? openUrlInBrowser)(authorizationUrl);
      options.diagnostics.info(
        "Opened the iRacing authorization page in your browser.",
      );
    } catch {
      options.diagnostics.warn("Could not open the browser automatically.");
      options.diagnostics.warn(`Open this URL manually: ${authorizationUrl}`);
    }
  } else {
    options.diagnostics.info(`Open this URL in a browser: ${authorizationUrl}`);
  }
}

function callbackHandler(
  client: OAuthClientLike,
  redirectUri: string,
  callbackPath: string,
  {
    resolve,
    reject,
  }: {
    resolve: (token: OAuthTokenResponse) => void;
    reject: (error: unknown) => void;
  },
) {
  let callbackClaimed = false;

  return async (request: IncomingMessage, response: ServerResponse) => {
    const requestUrl = new URL(request.url ?? "/", redirectUri);

    if (requestUrl.pathname !== callbackPath) {
      response.statusCode = 404;
      response.end("Not found.");

      return;
    }

    if (callbackClaimed) {
      response.statusCode = 409;
      response.end("OAuth callback already received.");

      return;
    }

    callbackClaimed = true;

    try {
      const token = await client.callback(requestUrl.searchParams, SESSION_ID);

      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(
        "<h1>Authenticated</h1><p>You can return to the terminal.</p>",
      );
      resolve(token);
    } catch {
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(
        "<h1>Authentication failed</h1><p>Return to the terminal for details.</p>",
      );
      reject(new Error("iRacing OAuth authentication failed."));
    }
  };
}

function browserOAuthClient(
  options: BrowserLoginOptions,
  redirectUri: string,
): OAuthClientLike {
  const config: OAuthClientConfig = {
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    redirectUri,
    scopes: options.scopes ?? DEFAULT_SCOPES,
  };

  return options.clientFactory
    ? options.clientFactory(config)
    : new OAuthClient({
        clientMetadata: { ...config, scopes: [...config.scopes] },
        stateStore: new InMemoryStore<string, InternalState>(),
        sessionStore: new InMemoryStore<string, OAuthTokenResponse>(),
      });
}

async function cleanupBrowserListener(
  server: Server,
  timeout: NodeJS.Timeout | undefined,
  {
    signalSource,
    onSignal,
  }: { signalSource: SignalSource; onSignal: () => void },
) {
  if (timeout) {
    clearTimeout(timeout);
  }

  signalSource.off("SIGINT", onSignal);
  signalSource.off("SIGTERM", onSignal);
  await closeServer(server);
}
