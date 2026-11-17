import { dirname, join } from "node:path";
import { Command } from "@commander-js/extra-typings";
import { createCatalogReferenceQueries } from "@iracing-data/mcp";
import { OAuthTokenDocumentSessionStore } from "@iracing-data/oauth-client";
import * as z from "zod";
import { createTokenProvider } from "../../../access-token.js";
import { createAssetCatalogs } from "../../../adapters/assets.js";
import { createReferenceCatalogs } from "../../../adapters/catalog.js";
import { createFetchQueries } from "../../../adapters/fetch.js";
import { createAssetMediaReader } from "../../../adapters/media.js";
import { createReferenceDocuments } from "../../../adapters/reference-documents.js";
import { createMcpServices } from "../../../composition.js";
import { createStdioTransport } from "../../../transports/index.js";
import { createHttpListener } from "../../http.js";
import * as commandOptions from "./options.js";
import { ServeOptionsSchema } from "./schema.js";
import type { ServeOptions } from "./schema.js";
import type { AccessTokenProvider } from "../../../token-provider.js";
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

      const result = ServeOptionsSchema.safeParse(raw);

      if (!result.success) {
        command.error(z.prettifyError(result.error));

        return;
      }

      const options = result.data;

      const tokenResolver = createServeTokenProvider(options, sessionKey);

      const resources = createServeResources(raw.credentials, tokenResolver);

      const services = createMcpServices(
        createFetchQueries(tokenResolver),
        createCatalogReferenceQueries(
          resources.catalogs,
          resources.assets.catalogs,
        ),
      );

      if (options.transport === "http") {
        logger.trace("Configuring HTTP listener");

        createHttpListener({
          logger: logger.child({ service: "HttpListener" }),
          host: options.host,
          port: options.port,
          services,
          ...resources,
        });
      } else {
        logger.trace("Configuring stdio transport");

        createStdioTransport({
          services,
          ...resources,
          serveOptions: {
            onerror: (error) => {
              logger.error({ error }, "stdio transport error");
            },
          },
        });
      }
    });
}

function createServeResources(
  credentials: string,
  tokenResolver: AccessTokenProvider,
) {
  const directory = join(dirname(credentials), "reference");

  return {
    catalogs: createReferenceCatalogs(directory, tokenResolver),
    documents: createReferenceDocuments(directory, tokenResolver),
    assets: {
      catalogs: createAssetCatalogs(directory, tokenResolver),
      readMedia: createAssetMediaReader(),
    },
  };
}

function createServeTokenProvider(
  options: ServeOptions,
  sessionKey: string,
): AccessTokenProvider {
  if ("accessToken" in options) {
    return () => Promise.resolve(options.accessToken);
  }

  return createTokenProvider({
    sessionKey,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    maskedClientSecret: options.maskedClientSecret,
    scopes: ["iracing.auth", "iracing.profile"],
    username: options.username,
    password: options.password,
    maskedPassword: options.maskedPassword,
    redirectUri: options.redirectUri,
    sessionStore: new OAuthTokenDocumentSessionStore({
      filePath: options.credentials,
      sessionKey,
    }),
  });
}
