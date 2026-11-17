import { dirname, join } from "node:path";
import { Command } from "@commander-js/extra-typings";
import {
  createCatalogReferenceQueries,
  createIracingMcpServer,
} from "@iracing-data/mcp";
import { OAuthTokenDocumentSessionStore } from "@iracing-data/oauth-client";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod";
import { createTokenProvider } from "../../../access-token.js";
import { createAssetCatalogs } from "../../../adapters/assets.js";
import { createReferenceCatalogs } from "../../../adapters/catalog.js";
import { createFetchQueries } from "../../../adapters/fetch.js";
import { createAssetMediaReader } from "../../../adapters/media.js";
import { createReferenceDocuments } from "../../../adapters/reference-documents.js";
import { createMcpServices } from "../../../composition.js";
import { createHttpListener } from "../../http.js";
import * as commandOptions from "./options.js";
import { ServeOptionsSchema } from "./schema.js";
import type { AuthenticationOptions } from "./schema.js";
import type { CreateTokenProviderOptions } from "../../../access-token.js";
import type pino from "pino";

/**
 * Options for configuring the program.
 */
export interface ServeCommandOptions {
  /** Logger interface. */
  logger: pino.Logger;

  /** Session storage key. */
  sessionKey?: string;
}

/**
 * Creates a commanderjs command for serving an MCP service.
 * @param {ServeCommandOptions} options - Program customizations and options.
 * @returns {Command} Command for the CLI entry-point.
 */
export function createServeCommand({
  logger,
  sessionKey = "iracing-data-mcp-session",
}: ServeCommandOptions) {
  return new Command("serve")
    .addOption(commandOptions.credentialsOption)
    .addOption(commandOptions.accessTokenOption)
    .addOption(commandOptions.clientIdOption)
    .addOption(commandOptions.clientSecretOption)
    .addOption(commandOptions.maskedClientSecretOption)
    .addOption(commandOptions.usernameOption)
    .addOption(commandOptions.passwordOption)
    .addOption(commandOptions.maskedPasswordOption)
    .addOption(commandOptions.redirectUriOption)
    .addOption(commandOptions.transportOption)
    .action((raw, command) => {
      if (process.env.IRACING_MCP_CREDENTIAL_FILE !== undefined) {
        command.error(
          "IRACING_MCP_CREDENTIAL_FILE is retired; use IRACING_CREDENTIALS instead.",
        );
      }

      const result = ServeOptionsSchema.safeParse({
        ...raw,
        credentialsFile: raw.credentials,
      });

      if (!result.success) {
        command.error(z.prettifyError(result.error));

        return;
      }

      const options = result.data;

      const server = createMcpServer({
        ...options,
        sessionKey,
        outputDirectory: join(dirname(raw.credentials), "reference"),
      });

      if (options.transport === "http") {
        logger.trace("Configuring HTTP listener");

        createHttpListener({
          server,
          logger: logger.child({ service: "HttpListener" }),
          host: options.host,
          port: options.port,
        });
      } else {
        logger.trace("Configuring stdio transport");

        serveStdio(() => server, {
          onerror: (error) => {
            logger.error({ error }, "stdio transport error");
          },
        });
      }
    });
}

/**
 * Options for creating the MCP server.
 */
export type CreateMcpServerOptions = CreateServeTokenProviderOptions & {
  outputDirectory: string;
};

function createMcpServer({
  sessionKey,
  outputDirectory,
  ...options
}: CreateMcpServerOptions) {
  const tokenResolver = createServeTokenProvider({
    sessionKey,
    ...options,
  });

  const catalogs = createReferenceCatalogs(outputDirectory, tokenResolver);

  const assetCatalogs = createAssetCatalogs(outputDirectory, tokenResolver);

  const services = createMcpServices(
    createFetchQueries(tokenResolver),
    createCatalogReferenceQueries(catalogs, assetCatalogs),
  );

  return createIracingMcpServer({
    services,
    catalogs,
    documents: createReferenceDocuments(outputDirectory, tokenResolver),
    assets: {
      catalogs: assetCatalogs,
      readMedia: createAssetMediaReader(),
    },
    serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
  });
}

type CreateServeTokenProviderOptions = AuthenticationOptions &
  Pick<CreateTokenProviderOptions, "sessionKey">;

function createServeTokenProvider(options: CreateServeTokenProviderOptions) {
  if (options.kind === "access_token") {
    return () => Promise.resolve(options.accessToken);
  }

  // !!!: Credentials file is only accessible when we determine it's not an access token provider.
  const sessionStore = new OAuthTokenDocumentSessionStore({
    filePath: options.credentialsFile,
    sessionKey: options.sessionKey,
  });

  return createTokenProvider({
    sessionStore,
    sessionKey: options.sessionKey,
    clientId: options.clientMetadata.clientId,
    clientSecret: options.clientMetadata.clientSecret,
    maskedClientSecret: options.clientMetadata.maskedClientSecret,
    scopes: ["iracing.auth", "iracing.profile"],
    ...(options.kind === "authorization_code"
      ? {
          redirectUri: options.clientMetadata.redirectUri,
        }
      : {
          username: options.clientMetadata.username,
          password: options.clientMetadata.password,
          maskedPassword: options.clientMetadata.maskedPassword,
        }),
  });
}
