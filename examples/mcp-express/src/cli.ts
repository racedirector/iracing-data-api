#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command, Option } from "@commander-js/extra-typings";
import {
  InMemoryStore,
  InternalState,
  OAuthClient,
} from "@iracing-data/oauth-client";
import { createOAuthClient, FileSessionStore } from "./credentials";
import { AppLogger, createPinoLogger } from "./logger";
import { createServer as createMcpServer } from "./mcp";
import { createConfigurationResolver } from "./mcp/tools/resolvers/configuration";
import { createFetchIRacingLinkService } from "./services/iracing-link";
import { createExpressTransport } from "./transports/express";
import { createHttpTransport } from "./transports/http";
import { createStdIoTransport } from "./transports/stdio";
import { registerTerminationHandlers } from "./transports/transport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createPinoLogger();

export interface CreateServerOptions {
  logger: AppLogger;
  oauth: {
    sessionStore: OAuthClient["sessionStore"];
  };
}

function createServer({
  logger,
  oauth: { sessionStore },
}: CreateServerOptions) {
  const oauthClient = createOAuthClient({
    sessionStore,
    clientId: process.env.IRACING_AUTH_CLIENT!,
    clientSecret: process.env.IRACING_AUTH_SECRET,
    redirectUri: "http://127.0.0.1:3000/api/auth/iracing/callback",
    scopes: ["iracing.auth", "iracing.profile"],
    stateStore: new InMemoryStore<string, InternalState>(),
  });

  return () =>
    createMcpServer({
      serverInfo: { name: "iracing-data", version: "1.0.0" },
      logger,
      linkService: createFetchIRacingLinkService({
        fetchApi: fetch,
        now: Date.now,
      }),
      resolveConfiguration: createConfigurationResolver({
        accessTokenResolver: async () => {
          const session = await oauthClient.restoreSessionForId("local");
          if (!session) {
            throw new Error("Could not fetch access token for identity.");
          }

          return session.access_token;
        },
      }),
    });
}

const program = new Command("iracing-data-mcp")
  .description("iRacing `/data` API MCP server")
  .showHelpAfterError()
  .addOption(
    new Option("--credentials <path>", "path to JSON credentials")
      .default(
        path.resolve(__dirname, "../../../../.iracing-data/credentials.json"),
      )
      .env("IRACING_CREDENTIALS_PATH"),
  );

program
  .command("express")
  .description("Start an express server")
  .action((_, command) => {
    const { credentials } = command.optsWithGlobals();
    const expressLogger = logger.child({ transport: "express" });

    registerTerminationHandlers(
      createExpressTransport({
        createServer: createServer({
          logger: expressLogger,
          oauth: {
            sessionStore: new FileSessionStore(credentials),
          },
        }),
        logger: expressLogger,
      }),
      expressLogger,
    );
  });

program
  .command("stdio", { isDefault: true })
  .description("Start a stdio server")
  .action((_, command) => {
    const { credentials } = command.optsWithGlobals();
    const stdioLogger = logger.child({ transport: "stdio" });

    registerTerminationHandlers(
      createStdIoTransport({
        createServer: createServer({
          logger: stdioLogger,
          oauth: {
            sessionStore: new FileSessionStore(credentials),
          },
        }),
        logger: stdioLogger,
      }),
      stdioLogger,
    );
  });

program
  .command("http")
  .description("Start a Node HTTP server")
  .action((_, command) => {
    const { credentials } = command.optsWithGlobals();
    const httpLogger = logger.child({ transport: "http" });

    registerTerminationHandlers(
      createHttpTransport({
        createServer: createServer({
          logger: httpLogger,
          oauth: {
            sessionStore: new FileSessionStore(credentials),
          },
        }),
        logger: httpLogger,
      }),
      httpLogger,
    );
  });

// Run the program
program.parseAsync().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : "MCP CLI failed");
  process.exitCode = 1;
});
