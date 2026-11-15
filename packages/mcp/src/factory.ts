import { McpServer } from "@modelcontextprotocol/server";
import { registerIracingTools } from "./register.js";
import type { IracingToolServices } from "./services.js";

/** Constructor inputs for a fresh, unconnected MCP server. */
export interface IracingMcpServerOptions {
  readonly serverInfo: ConstructorParameters<typeof McpServer>[0];
  readonly serverOptions?: ConstructorParameters<typeof McpServer>[1];
  readonly services: IracingToolServices;
}

/** Create a new, unconnected MCP server with exactly eight standard tools. */
export function createIracingMcpServer({
  serverInfo,
  serverOptions,
  services,
}: IracingMcpServerOptions): McpServer {
  const server = new McpServer(serverInfo, serverOptions);
  registerIracingTools(server, services);
  return server;
}
