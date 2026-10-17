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
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthScopeList,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { getAuthCode, type AuthorizationUrlBuilder } from "oauth-callback";
import { openUrlInBrowser } from "./browser.js";

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
   * @param {string} [state] - Fresh state supplied by the callback listener, or generated when omitted.
   * @returns {Promise<{ url: URL }>} Authorization URL with retained state and PKCE context.
   */
  authorize(state?: string): Promise<{ url: URL }>;

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

  /**
   * Opens the authorization URL; failures fall back to manual login on stderr.
   * @param {URL} url - Authorization URL to open.
   * @returns {unknown} Completion of the browser handoff.
   */
  launch?: (url: URL) => unknown;

  /**
   * Constructs the OAuth lifecycle owner for the selected registration.
   * @param {OAuthClientConfig} config - Validated registration, transport, or verification settings.
   * @returns {OAuthClientLike} OAuth lifecycle owner configured for the selected registration.
   */
  clientFactory?: (config: OAuthClientConfig) => OAuthClientLike;
}

/**
 * Opens browser authorization through oauth-callback, then exchanges the callback for tokens.
 * With the default OAuth client, stores the session in memory under the CLI session key
 * without fetching a profile or writing credentials to disk.
 *
 * The prebuilt authorization URL requires a fixed-port HTTP loopback redirect URI;
 * oauth-callback rejects port 0, including the default URI used when none is supplied.
 * The callback timeout excludes token exchange. No process-signal handlers are installed.
 * @param {BrowserLoginOptions} options - OAuth registration and optional client factory. Scopes default to auth and profile; timeoutSeconds must convert to an integer from 1 through 2147483647 milliseconds.
 * @returns {Promise<OAuthTokenResponse>} OAuth credentials obtained from the completed browser callback.
 * @throws {TypeError} If oauth-callback rejects the authorization URL or redirect URI.
 * @throws {RangeError} If the converted callback timeout is outside the supported integer range.
 * @throws {Error} Propagates client construction, authorization, listener, browser launch, callback timeout, and token exchange or validation failures unchanged.
 */
export async function authenticateWithBrowser(
  options: BrowserLoginOptions,
): Promise<OAuthTokenResponse> {
  const controller = new AbortController();

  const cancel = () => {
    controller.abort(new Error("Authentication cancelled."));
  };

  process.once("SIGINT", cancel);
  process.once("SIGTERM", cancel);

  try {
    let client!: OAuthClientLike;

    const authorize = async (redirectUri: string, state?: string) => {
      const config = {
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        redirectUri,
        scopes: [...(options.scopes ?? DEFAULT_SCOPES)],
      };

      client =
        options.clientFactory?.(config) ??
        new OAuthClient({
          clientMetadata: config,
          stateStore: new InMemoryStore<string, InternalState>(),
          sessionStore: new InMemoryStore<string, OAuthTokenResponse>(),
        });

      return (await client.authorize(state)).url;
    };

    const builder: AuthorizationUrlBuilder = ({ redirectUri, state }) =>
      authorize(redirectUri, state);

    const authorization = options.redirectUri
      ? await authorize(options.redirectUri)
      : builder;

    const { params } = await getAuthCode(authorization, {
      redirectUri: options.redirectUri ?? DEFAULT_REDIRECT_URI,
      timeout: options.timeoutSeconds * 1000,
      signal: controller.signal,
      async launch(url) {
        try {
          await (options.launch ?? openUrlInBrowser)(url);
        } catch {
          process.stderr.write(`Open this URL to log in: ${url.href}\n`);
        }
      },
    });

    return await client.callback(params, SESSION_ID);
  } finally {
    process.removeListener("SIGINT", cancel);
    process.removeListener("SIGTERM", cancel);
  }
}
