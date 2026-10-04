import { createServer, type Server } from "node:http";
import {
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { openUrlInBrowser } from "./browser.js";
import type { AddressInfo } from "node:net";
import type { Diagnostics } from "./diagnostics.js";

const CALLBACK_HOST = "127.0.0.1";
const CALLBACK_PATH = "/oauth/iracing/callback";
const SESSION_ID = "iracing-data-cli";
const SCOPES = ["iracing.auth"] as const;

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
  scopes: readonly ["iracing.auth"];
};

export type SignalSource = {
  once(signal: NodeJS.Signals, listener: () => void): unknown;
  off(signal: NodeJS.Signals, listener: () => void): unknown;
};

export type BrowserLoginOptions = {
  clientId: string;
  clientSecret?: string;
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
      server.once("error", reject);
      server.listen(0, CALLBACK_HOST, () => resolve());
    });

    const address = server.address() as AddressInfo | null;
    if (!address) {
      throw new Error("OAuth callback listener did not expose an address.");
    }

    const redirectUri = `http://${CALLBACK_HOST}:${address.port}${CALLBACK_PATH}`;
    const config: OAuthClientConfig = {
      clientId,
      clientSecret,
      redirectUri,
      scopes: SCOPES,
    };
    const client = options.clientFactory
      ? options.clientFactory(config)
      : new OAuthClient({
          clientMetadata: config,
          stateStore: new InMemoryStore<string, InternalState>(),
          sessionStore: new InMemoryStore<string, OAuthTokenResponse>(),
        });

    const { url } = await client.authorize();
    const callbackPromise = new Promise<OAuthTokenResponse>(
      (resolve, reject) => {
        rejectFlow = reject;
        timeout = setTimeout(
          () => reject(new Error("Timed out waiting for the OAuth callback.")),
          Math.round(timeoutSeconds * 1000),
        );
        signalSource.once("SIGINT", onSignal);
        signalSource.once("SIGTERM", onSignal);

        server.on("request", async (request, response) => {
          const requestUrl = new URL(request.url ?? "/", redirectUri);
          if (requestUrl.pathname !== CALLBACK_PATH) {
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
