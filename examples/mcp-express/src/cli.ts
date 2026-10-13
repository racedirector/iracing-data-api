#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command, Option } from "@commander-js/extra-typings";
import { InMemoryStore, InternalState } from "@iracing-data/oauth-client";
import { createOAuthClient, FileSessionStore } from "./credentials";
import { AppLogger, createPinoLogger } from "./logger";
import { createServer as createMcpServer } from "./mcp";
import { createConfigurationResolver } from "./mcp/tools/resolvers/configuration";
import { createServiceRunner } from "./service-runner";
import {
  createBestEffortCacheResolver,
  createMemoryCacheStore,
  createScopedCacheResolver,
} from "./services/cache";
import {
  configureExpressTransport,
  configureHttpTransport,
  createStdIoTransport,
} from "./transports";
import type { McpServerFactory } from "@modelcontextprotocol/server";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const logger = createPinoLogger();

/** Parsed command options; required values are validated before composing services. */
interface ServiceConfiguration {
  credentials: string;
  clientId?: string;
  clientSecret?: string;
}

interface CompositionContext {
  logger: AppLogger;
}

/**
 * Compose dependencies once for the selected command. The returned factory may
 * create several MCP servers, all sharing this command's OAuth owner and policies.
 */
function composeMcpServer(
  configuration: ServiceConfiguration,
  context: CompositionContext,
): McpServerFactory {
  if (!configuration.clientId?.trim()) {
    throw new Error("Set IRACING_AUTH_CLIENT to a nonempty client ID.");
  }

  if (
    configuration.clientSecret !== undefined &&
    !configuration.clientSecret.trim()
  ) {
    throw new Error("IRACING_AUTH_SECRET must be nonempty when provided.");
  }

  const oauthClient = createOAuthClient({
    sessionStore: new FileSessionStore(configuration.credentials),
    clientId: configuration.clientId,
    clientSecret: configuration.clientSecret,
    redirectUri: "http://127.0.0.1:3000/api/auth/iracing/callback",
    scopes: ["iracing.auth", "iracing.profile"],
    stateStore: new InMemoryStore<string, InternalState>(),
  });

  const resolveConfiguration = createConfigurationResolver({
    accessTokenResolver: async () => {
      // !!!: This only works for local deploy; remote deploy semantics are still being developed.
      const session = await oauthClient.restoreSessionForId("local");

      if (!session) {
        throw new Error("No local iRacing session was found");
      }

      return session.access_token;
    },
  });

  const backingCache = createMemoryCacheStore({
    now: Date.now,
  });

  const cache = createScopedCacheResolver({
    cache: createBestEffortCacheResolver({
      cache: backingCache,
      logger,
    }),
    scope: "local",
  });

  // Keep the SDK context for future per-principal composition.
  return (_mcpContext) =>
    createMcpServer({
      serverInfo: { name: "iracing-data", version: "1.0.0" },
      resolveConfiguration,
      cache,
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
  )
  .addOption(
    new Option("--client-id <id>").env("IRACING_AUTH_CLIENT").hideHelp(),
  )
  .addOption(
    new Option("--client-secret <secret>")
      .env("IRACING_AUTH_SECRET")
      .hideHelp(),
  )
  .hook("preAction", (command) => {
    // Hidden options still accept arguments unless their source is checked.
    // Keep this policy at the root and never include rejected values in errors.
    for (const [option, environment] of [
      ["clientId", "IRACING_AUTH_CLIENT"],
      ["clientSecret", "IRACING_AUTH_SECRET"],
      ["errorDetails", "IRACING_MCP_ERROR_DETAILS"],
    ] as const) {
      const source = command.getOptionValueSource(option);

      if (source !== undefined && source !== "env" && source !== "default") {
        command.error(`Provide ${environment} through the environment only.`, {
          code: "commander.environmentOnly",
        });
      }
    }
  });

// Commands choose a transport; the runner handles the shared process lifecycle.
const runService = createServiceRunner({
  logger,
  lifecycle: process,
  composeServer: composeMcpServer,
});

program
  .command("express")
  .description("Start an express server")
  .action(async (_, command) => {
    await runService({
      name: "express",
      configuration: command.optsWithGlobals(),
      transport: configureExpressTransport({
        host: "127.0.0.1",
        port: 3000,
        path: "/mcp",
      }),
    });
  });

program
  .command("stdio", { isDefault: true })
  .description("Start a stdio server")
  .action(async (_, command) => {
    await runService({
      name: "stdio",
      configuration: command.optsWithGlobals(),
      transport: createStdIoTransport,
    });
  });

program
  .command("http")
  .description("Start a Node HTTP server")
  .action(async (_, command) => {
    await runService({
      name: "http",
      configuration: command.optsWithGlobals(),
      transport: configureHttpTransport({ host: "127.0.0.1", port: 3000 }),
    });
  });

// Run the program
program.parseAsync().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : "MCP CLI failed");
  process.exitCode = 1;
});
