import { McpServer } from "@modelcontextprotocol/server";
import { AppLogger } from "../logger";
import { IRacingLinkService } from "../services/iracing-link";
import { createGetMyDriverTool } from "./tools/get-my-driver";
import { ConfigurationResolver } from "./tools/resolvers/configuration";

export interface CreateServerOptions {
  logger: AppLogger;
  linkService: IRacingLinkService;
  resolveConfiguration: ConfigurationResolver;
}

export function createServer({
  logger,
  linkService,
  resolveConfiguration,
}: CreateServerOptions) {
  const server = new McpServer({ name: "iracing-data", version: "1.0.0" });

  createGetMyDriverTool(server, {
    resolveConfiguration,
    linkService,
    logger,
  });

  return server;
}
