#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { createOAuthClient } from "./credentials";
import { AppLogger, createPinoLogger } from "./logger";
import { createServer as createMcpServer } from "./mcp";
import { createConfigurationResolver } from "./mcp/tools/resolvers/configuration";
import { createFetchIRacingLinkService } from "./services/iracing-link";
import { createExpressTransport } from "./transports/express";
import { createHttpTransport } from "./transports/http";
import { createStdIoTransport } from "./transports/stdio";
import { registerTerminationHandlers } from "./transports/transport";

const logger = createPinoLogger();

function createServer(logger: AppLogger) {
  const oauthClient = createOAuthClient({
    clientId: process.env.IRACING_AUTH_CLIENT!,
    clientSecret: process.env.IRACING_AUTH_SECRET,
    redirectUri: "http://127.0.0.1:3000/api/auth/iracing/callback",
    scopes: ["iracing.auth", "iracing.profile"],
  });

  const linkService = createFetchIRacingLinkService();

  const resolveConfiguration = createConfigurationResolver({
    accessTokenResolver: async ({ auth }) => {
      const identity = auth?.clientId || "local";
      const session = await oauthClient.restoreSessionForId(identity);
      if (!session) {
        throw new Error("Could not fetch access token for identity.");
      }

      return session.access_token;
    },
  });

  return () =>
    createMcpServer({
      logger,
      linkService,
      resolveConfiguration,
    });
}

const program = new Command("iracing-data-mcp").description(
  "iRacing `/data` API MCP server",
);

program
  .command("express")
  .description("Start an express server")
  .action(() => {
    const expressLogger = logger.child({ transport: "express" });

    registerTerminationHandlers(
      createExpressTransport({
        createServer: createServer(expressLogger),
        logger: expressLogger,
      }),
      expressLogger,
    );
  });

program
  .command("stdio", { isDefault: true })
  .description("Start a stdio server")
  .action(() => {
    const stdioLogger = logger.child({ transport: "stdio" });

    registerTerminationHandlers(
      createStdIoTransport({
        createServer: createServer(stdioLogger),
        logger: stdioLogger,
      }),
      stdioLogger,
    );
  });

program
  .command("http")
  .description("Start a Node HTTP server")
  .action(() => {
    const httpLogger = logger.child({ transport: "http" });

    registerTerminationHandlers(
      createHttpTransport({
        createServer: createServer(httpLogger),
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
