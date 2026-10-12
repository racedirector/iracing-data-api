import { McpServer } from "@modelcontextprotocol/server";
import { AppLogger } from "../logger";
import { IRacingLinkService } from "../services/iracing-link";
import { createGetMyDriverTool } from "./tools/get-my-driver";
import { ConfigurationResolver } from "./tools/resolvers/configuration";

export interface CreateServerOptions {
  serverInfo: ConstructorParameters<typeof McpServer>[0];
  logger: AppLogger;
  linkService: IRacingLinkService;
  resolveConfiguration: ConfigurationResolver;
}

export function createServer({
  serverInfo,
  logger,
  linkService,
  resolveConfiguration,
}: CreateServerOptions) {
  const server = new McpServer(serverInfo);

  createGetMyDriverTool(server, {
    resolveConfiguration,
    linkService,
    logger,
  });

  return server;
}
