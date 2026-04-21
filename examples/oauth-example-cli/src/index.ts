#!/usr/bin/env node

import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { Command } from "@commander-js/extra-typings";
import {
  InMemoryStore,
  InternalState,
  IRacingOAuthTokenResponse,
  OAuthClient,
} from "@iracing-data/oauth-client";
import * as dotenv from "dotenv";

dotenv.config();

const CALLBACK_PATH = "/oauth/iracing/callback";
const CALLBACK_HOST = "127.0.0.1";
const SCOPES: Array<"iracing.profile" | "iracing.auth"> = [
  "iracing.profile",
  "iracing.auth",
];
const SESSION_ID = "oauth-example-cli";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.join(__dirname, "..");
const defaultCredentialsPath = path.join(projectRootDir, "credentials.json");

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function openUrlInBrowser(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const command =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "cmd"
          : "xdg-open";
    const args =
      process.platform === "win32" ? ["/c", "start", "", url] : [url];

    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
    });

    child.on("error", reject);
    child.unref();
    resolve();
  });
}

async function waitForOAuthCallback(
  client: OAuthClient,
  callbackPort: number,
  credentialsPath: string,
  timeoutMs: number,
): Promise<IRacingOAuthTokenResponse> {
  return await new Promise((resolve, reject) => {
    let isSettled = false;

    const server = createServer(async (request, response) => {
      try {
        const requestUrl = new URL(
          request.url ?? "",
          `http://${CALLBACK_HOST}:${callbackPort}`,
        );

        if (requestUrl.pathname !== CALLBACK_PATH) {
          response.statusCode = 404;
          response.end("Not found.");
          return;
        }

        const token = await client.callback(
          new URLSearchParams(requestUrl.searchParams),
          SESSION_ID,
        );

        await writeFile(
          credentialsPath,
          `${JSON.stringify(token, null, 2)}\n`,
          {
            encoding: "utf-8",
          },
        );

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(
          "<h1>Authenticated</h1><p>You can now return to the CLI.</p>",
        );

        if (!isSettled) {
          isSettled = true;
          server.close();
          resolve(token);
        }
      } catch (error) {
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(
          "<h1>OAuth callback failed</h1><p>See CLI output for details.</p>",
        );

        if (!isSettled) {
          isSettled = true;
          server.close();
          reject(error);
        }
      }
    });

    server.on("error", (error) => {
      if (!isSettled) {
        isSettled = true;
        reject(error);
      }
    });

    server.listen(callbackPort, CALLBACK_HOST, () => {
      const timeout = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          server.close();
          reject(
            new Error(
              `Timed out waiting for OAuth callback after ${timeoutMs / 1000}s.`,
            ),
          );
        }
      }, timeoutMs);

      server.once("close", () => {
        clearTimeout(timeout);
      });
    });
  });
}

const program = new Command("oauth-example-cli")
  .description(
    "CLI OAuth example for iRacing. Opens browser auth and writes credentials to disk.",
  )
  .option(
    "--callback-port <port>",
    "Local port for the OAuth callback server",
    process.env.OAUTH_CALLBACK_PORT ?? "4040",
  )
  .option(
    "--credentials-path <path>",
    "Output path for credentials.json",
    defaultCredentialsPath,
  )
  .option(
    "--timeout-seconds <seconds>",
    "How long to wait for callback before failing",
    "300",
  )
  .action(async (_, command) => {
    const { callbackPort, credentialsPath, timeoutSeconds } =
      command.optsWithGlobals();

    const resolvedPort = Number(callbackPort);
    if (!Number.isInteger(resolvedPort) || resolvedPort < 1) {
      throw new Error(`Invalid callback port: "${callbackPort}"`);
    }

    const resolvedTimeoutSeconds = Number(timeoutSeconds);
    if (
      !Number.isFinite(resolvedTimeoutSeconds) ||
      resolvedTimeoutSeconds <= 0
    ) {
      throw new Error(`Invalid timeout seconds: "${timeoutSeconds}"`);
    }

    const timeoutMs = Math.round(resolvedTimeoutSeconds * 1000);

    const clientId = getRequiredEnv("IRACING_AUTH_CLIENT");
    const redirectUri = `http://${CALLBACK_HOST}:${resolvedPort}${CALLBACK_PATH}`;
    const clientSecret = process.env.IRACING_AUTH_SECRET;

    const client = new OAuthClient({
      clientMetadata: {
        clientId,
        clientSecret,
        redirectUri,
        scopes: SCOPES,
      },
      stateStore: new InMemoryStore<string, InternalState>(),
      sessionStore: new InMemoryStore<string, IRacingOAuthTokenResponse>(),
    });

    const { url } = await client.authorize();

    console.info("iRacing OAuth CLI Example");
    console.info(`Redirect URI: ${redirectUri}`);
    console.info(`Credentials path: ${credentialsPath}`);

    const readline = createInterface({ input: stdin, output: stdout });
    await readline.question("Press Enter to open your browser and continue...");
    readline.close();

    try {
      await openUrlInBrowser(url.toString());
      console.info("Opened browser for OAuth sign-in.");
    } catch (error) {
      console.warn("Could not open browser automatically.");
      console.warn("Open this URL manually:");
      console.warn(url.toString());
      console.warn(error);
    }

    console.info("Waiting for OAuth callback...");
    const token = await waitForOAuthCallback(
      client,
      resolvedPort,
      credentialsPath,
      timeoutMs,
    );

    console.info("OAuth authentication complete.");
    console.info(`Access token expires in: ${token.expires_in}s`);
    if (token.refresh_token_expires_in) {
      console.info(
        `Refresh token expires in: ${token.refresh_token_expires_in}s`,
      );
    }
  });

program.parseAsync().catch((error) => {
  console.error("OAuth CLI flow failed.");
  console.error(error);
  process.exitCode = 1;
});
