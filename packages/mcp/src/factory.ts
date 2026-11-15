import { McpServer } from "@modelcontextprotocol/server";
import { registerIracingTools } from "./register.js";
import type { IracingToolServices } from "./services.js";

/** Dependencies for constructing a new listener-free server. */
export interface IracingMcpServerOptions {
  readonly serverInfo: ConstructorParameters<typeof McpServer>[0];
  readonly serverOptions?: ConstructorParameters<typeof McpServer>[1];
  readonly services: IracingToolServices;
}

/** Construct an unconnected MCP server and register the two tools. */
export function createIracingMcpServer({
  serverInfo,
  serverOptions,
  services,
}: IracingMcpServerOptions): McpServer {
  const server = new McpServer(serverInfo, serverOptions);
  registerIracingTools(server, services);
  return server;
}
