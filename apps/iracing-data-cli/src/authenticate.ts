import { createServer, type Server } from "node:http";
import {
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { openUrlInBrowser } from "./browser.js";
import type { Diagnostics } from "./diagnostics.js";
import type { AddressInfo } from "node:net";

const CALLBACK_HOST = "127.0.0.1";
const CALLBACK_PATH = "/oauth/iracing/callback";
const DEFAULT_REDIRECT_URI = `http://${CALLBACK_HOST}:0${CALLBACK_PATH}`;
const SESSION_ID = "iracing-data-cli";
const SCOPES = ["iracing.auth", "iracing.profile"] as const;

export type OAuthClientLike = {
  authorize(): Promise<{ url: URL }>;
  callback(
    params: URLSearchParams,
    sessionId?: string,
  ): Promise<OAuthTokenResponse>;
};

export type OAuthClientConfig = {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: readonly ["iracing.auth", "iracing.profile"];
};

export type SignalSource = {
  once(signal: NodeJS.Signals, listener: () => void): unknown;
  off(signal: NodeJS.Signals, listener: () => void): unknown;
};

export type BrowserLoginOptions = {
  clientId: string;
  clientSecret?: string;
  redirectUri?: string;
  timeoutSeconds: number;
  openBrowser: boolean;
  diagnostics: Diagnostics;
  browserOpener?: (url: string) => Promise<void>;
  clientFactory?: (config: OAuthClientConfig) => OAuthClientLike;
  signalSource?: SignalSource;
};

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    if (!server.listening) return resolve();
    server.close(() => resolve());
    server.closeAllConnections();
  });
}

export async function authenticateWithBrowser(
  options: BrowserLoginOptions,
): Promise<OAuthTokenResponse> {
  const {
    clientId,
    clientSecret,
    timeoutSeconds,
    openBrowser,
    diagnostics,
    browserOpener = openUrlInBrowser,
    signalSource = process,
  } = options;

  if (!clientId) {
    throw new Error(
      "Missing required environment variable: IRACING_AUTH_CLIENT",
    );
  }
  if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
    throw new Error("--timeout-seconds must be a positive number");
  }

  const registeredRedirectUri = options.redirectUri ?? DEFAULT_REDIRECT_URI;
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
  const callbackHost = callbackUrl.hostname.replace(/^\[|\]$/g, "");
  const callbackPort = Number(callbackUrl.port || "80");

  const server = createServer();
  let timeout: NodeJS.Timeout | undefined;
  let callbackClaimed = false;
  let rejectFlow: ((reason?: unknown) => void) | undefined;

  const onSignal = () => rejectFlow?.(new Error("Authentication cancelled."));
  const cleanup = async () => {
    if (timeout) clearTimeout(timeout);
    signalSource.off("SIGINT", onSignal);
    signalSource.off("SIGTERM", onSignal);
    await closeServer(server);
  };

  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", () =>
        reject(
          new Error(
            "Could not bind the OAuth callback listener. Free the port configured by IRACING_AUTH_REDIRECT_URI, or configure another loopback URI registered with iRacing.",
          ),
        ),
      );
      server.listen(callbackPort, callbackHost, () => resolve());
    });

    const address = server.address() as AddressInfo | null;
    if (!address) {
      throw new Error("OAuth callback listener did not expose an address.");
    }

    // Preserve the registered URI byte-for-byte except for native-app port 0.
    const redirectUri =
      callbackPort === 0
        ? registeredRedirectUri.replace(/:0(?=\/|\?|$)/, `:${address.port}`)
        : registeredRedirectUri;
    const config: OAuthClientConfig = {
      clientId,
      clientSecret,
      redirectUri,
      scopes: SCOPES,
    };
    const client = options.clientFactory
      ? options.clientFactory(config)
      : new OAuthClient({
          clientMetadata: { ...config, scopes: [...config.scopes] },
          stateStore: new InMemoryStore<string, InternalState>(),
          sessionStore: new InMemoryStore<string, OAuthTokenResponse>(),
        });

    const { url } = await client.authorize();
    const callbackPromise = new Promise<OAuthTokenResponse>(
      (resolve, reject) => {
        rejectFlow = reject;
        timeout = setTimeout(
          () =>
            reject(
              new Error(
                "Timed out waiting for the OAuth callback. If iRacing rejected the URL, check IRACING_AUTH_CLIENT and ensure IRACING_AUTH_REDIRECT_URI matches a registered redirect URI (use port 0 only for a registered native-app URI).",
              ),
            ),
          Math.round(timeoutSeconds * 1000),
        );
        signalSource.once("SIGINT", onSignal);
        signalSource.once("SIGTERM", onSignal);

        server.on("request", async (request, response) => {
          const requestUrl = new URL(request.url ?? "/", redirectUri);
          if (requestUrl.pathname !== callbackUrl.pathname) {
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
            const token = await client.callback(
              requestUrl.searchParams,
              SESSION_ID,
            );
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
        });
      },
    );

    const authorizationUrl = url.toString();
    if (openBrowser) {
      try {
        await browserOpener(authorizationUrl);
        diagnostics.info(
          "Opened the iRacing authorization page in your browser.",
        );
      } catch {
        diagnostics.warn("Could not open the browser automatically.");
        diagnostics.warn(`Open this URL manually: ${authorizationUrl}`);
      }
    } else {
      diagnostics.info(`Open this URL in a browser: ${authorizationUrl}`);
    }
    diagnostics.info("Waiting for the OAuth callback...");

    return await callbackPromise;
  } finally {
    await cleanup();
  }
}
