import { McpServer } from "@modelcontextprotocol/server";
import { registerIracingTools } from "./register.js";
import { registerReferenceResources } from "./resources/index.js";
import type { ReferenceCatalog } from "./resources/service.js";
import type { IracingToolServices } from "./services.js";

/** Dependencies for constructing a new listener-free server. */
export interface IracingMcpServerOptions {
  /** Name and version advertised by this unconnected server. */
  readonly serverInfo: ConstructorParameters<typeof McpServer>[0];

  /** Optional MCP SDK capabilities and instructions. */
  readonly serverOptions?: ConstructorParameters<typeof McpServer>[1];

  /** Caller-owned selectors for the three supported tools. */
  readonly services: IracingToolServices;

  /** Optional reference catalogs with host-owned data access. */
  readonly catalogs?: readonly ReferenceCatalog[];
}

/**
 * Construct an unconnected MCP server and register tools and selected resources.
 * @param {IracingMcpServerOptions} root0 - Factory inputs provided by the consumer.
 * @param {IracingMcpServerOptions["serverInfo"]} root0.serverInfo - MCP server name and version.
 * @param {IracingMcpServerOptions["serverOptions"]} root0.serverOptions - Optional SDK server settings.
 * @param {IracingToolServices} root0.services - Request-local capability selectors.
 * @param {readonly ReferenceCatalog[]} root0.catalogs - Host-owned reference catalogs.
 * @returns {McpServer} New, unconnected MCP server with three tools registered.
 */
export function createIracingMcpServer({
  serverInfo,
  serverOptions,
  services,
  catalogs = [],
}: IracingMcpServerOptions): McpServer {
  const server = new McpServer(serverInfo, serverOptions);

  registerIracingTools(server, services);
  registerReferenceResources(server, catalogs);

  return server;
}
