import { Command } from "@commander-js/extra-typings";
import { OAuthTokenDocumentSessionStore } from "@iracing-data/oauth-client";
import * as z from "zod";
import { createFetchQueries } from "../../../adapters/fetch.js";
import { createStdioTransport } from "../../../transports/index.js";
import { createTokenProvider } from "../../access-token.js";
import { createHttpListener } from "../../http.js";
import * as commandOptions from "./options.js";
import { ServeOptionsSchema } from "./schema.js";
import type pino from "pino";

/**
 * Options for configuring the program.
 */
export interface ServeCommandOptions {
  /** Logger interface. */
  logger: pino.Logger;
}

/**
 * Creates a commanderjs command for serving an MCP service.
 * @param {ServeCommandOptions} options - Program customizations and options.
 * @returns {Command} Command for the CLI entry-point.
 */
export function createServeCommand({ logger }: ServeCommandOptions) {
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
      const result = ServeOptionsSchema.safeParse(raw);

      if (!result.success) {
        command.error(z.prettifyError(result.error));

        return;
      }

      const options = result.data;

      const tokenResolver =
        "accessToken" in options
          ? () => Promise.resolve(options.accessToken)
          : createTokenProvider({
              clientId: options.clientId,
              clientSecret: options.clientSecret,
              maskedClientSecret: options.maskedClientSecret,
              scopes: [],
              username: options.username,
              password: options.password,
              maskedPassword: options.maskedPassword,
              redirectUri: options.redirectUri,
              sessionStore: new OAuthTokenDocumentSessionStore({
                filePath: options.credentials,
                sessionKey: "iracing-data-mcp",
              }),
            });

      const queries = createFetchQueries(tokenResolver);

      if (options.transport === "http") {
        logger.trace("Configuring HTTP listener");

        createHttpListener({
          logger: logger.child({ service: "HttpListener" }),
          host: options.host,
          port: options.port,
          resolveCapabilities: () => queries,
          resolveActor: () => ({ id: "http-mcp", provider: "http" }),
        });
      } else {
        logger.trace("Configuring stdio transport");

        createStdioTransport({
          actor: { id: "stdio", provider: "stdio" },
          resolveCapabilities: () => queries,
          serveOptions: {
            onerror: (error) => {
              logger.error({ error }, "stdio transport error");
            },
          },
        });
      }
    });
}
