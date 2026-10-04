import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import type { Diagnostics } from "./diagnostics.js";
import { openUrlInBrowser } from "./browser.js";

const CALLBACK_HOST = "127.0.0.1";
const CALLBACK_PATH = "/oauth/iracing/callback";
const SESSION_ID = "iracing-data-cli";

export type BrowserLoginOptions = {
  clientId: string;
  clientSecret?: string;
  timeoutSeconds: number;
  openBrowser: boolean;
  diagnostics: Diagnostics;
  browserOpener?: (url: string) => Promise<void>;
};

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close(() => resolve());
  });
}

export async function authenticateWithBrowser({
  clientId,
  clientSecret,
  timeoutSeconds,
  openBrowser,
  diagnostics,
  browserOpener = openUrlInBrowser,
}: BrowserLoginOptions): Promise<OAuthTokenResponse> {
  if (!clientId) {
    throw new Error("Missing required environment variable: IRACING_AUTH_CLIENT");
  }
  if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
    throw new Error("--timeout-seconds must be a positive number");
  }

  const server = createServer();
  let timeout: NodeJS.Timeout | undefined;
  let callbackClaimed = false;
  let settled = false;

  const cleanup = async () => {
    if (timeout) clearTimeout(timeout);
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    await closeServer(server);
  };

  let rejectFlow: ((reason?: unknown) => void) | undefined;
  const onSignal = () => {
    if (!settled) rejectFlow?.(new Error("Authentication cancelled."));
  };

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, CALLBACK_HOST, () => resolve());
  });

  const address = server.address() as AddressInfo | null;
  if (!address) {
    await cleanup();
    throw new Error("OAuth callback listener did not expose an address.");
  }

  const redirectUri = `http://${CALLBACK_HOST}:${address.port}${CALLBACK_PATH}`;
  const client = new OAuthClient({
    clientMetadata: {
      clientId,
      clientSecret,
      redirectUri,
      scopes: ["iracing.auth"],
    },
    stateStore: new InMemoryStore<string, InternalState>(),
    sessionStore: new InMemoryStore<string, OAuthTokenResponse>(),
  });

  const { url } = await client.authorize();

  const callbackPromise = new Promise<OAuthTokenResponse>((resolve, reject) => {
    rejectFlow = reject;
    timeout = setTimeout(
      () => reject(new Error("Timed out waiting for the OAuth callback.")),
      Math.round(timeoutSeconds * 1000),
    );
    process.once("SIGINT", onSignal);
    process.once("SIGTERM", onSignal);

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
    });
  });

  const authorizationUrl = url.toString();
  if (openBrowser) {
    try {
      await browserOpener(authorizationUrl);
      diagnostics.info("Opened the iRacing authorization page in your browser.");
    } catch {
      diagnostics.warn("Could not open the browser automatically.");
      diagnostics.warn(`Open this URL manually: ${authorizationUrl}`);
    }
  } else {
    diagnostics.info(`Open this URL in a browser: ${authorizationUrl}`);
  }
  diagnostics.info("Waiting for the OAuth callback...");

  try {
    return await callbackPromise;
  } finally {
    settled = true;
    await cleanup();
  }
}
