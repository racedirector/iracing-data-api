import { McpServer } from "@modelcontextprotocol/server";
import { registerIracingTools } from "./register.js";
import { registerAssetResources } from "./resources/assets/index.js";
import { registerReferenceResources } from "./resources/index.js";
import type {
  AssetCatalog,
  ReadAssetMedia,
} from "./resources/assets/service.js";
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

  /** Optional static asset resources with host-owned metadata and media access. */
  readonly assets?: {
    readonly catalogs: readonly AssetCatalog[];
    readonly readMedia: ReadAssetMedia;
  };
}

/**
 * Construct an unconnected MCP server and register tools and selected resources.
 * @param {IracingMcpServerOptions} root0 - Factory inputs provided by the consumer.
 * @param {IracingMcpServerOptions["serverInfo"]} root0.serverInfo - MCP server name and version.
 * @param {IracingMcpServerOptions["serverOptions"]} root0.serverOptions - Optional SDK server settings.
 * @param {IracingToolServices} root0.services - Request-local capability selectors.
 * @param {readonly ReferenceCatalog[]} root0.catalogs - Host-owned reference catalogs.
 * @param {IracingMcpServerOptions["assets"]} root0.assets - Host-owned asset data access.
 * @returns {McpServer} New, unconnected MCP server with three tools registered.
 */
export function createIracingMcpServer({
  serverInfo,
  serverOptions,
  services,
  catalogs = [],
  assets,
}: IracingMcpServerOptions): McpServer {
  const server = new McpServer(serverInfo, serverOptions);

  registerIracingTools(server, services);
  registerReferenceResources(server, catalogs);
  if (assets) {
    registerAssetResources(server, assets.catalogs, assets.readMedia);
  }

  return server;
}
