import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { registerReferenceResources } from "../../resources.js";
import type { ReferenceCatalog } from "../../catalog.js";
import type { IracingToolServices } from "@iracing-data/mcp";
import type { ServeStdioOptions } from "@modelcontextprotocol/server/stdio";

/** Host-selected services for a local MCP connection. */
export interface McpStdioOptions {
  /** Tool services selected by the host, using the same contract as HTTP. */
  readonly services: IracingToolServices;

  /** Optional reference catalogs composed by the host. */
  readonly catalogs?: readonly ReferenceCatalog[];

  /** Stdio server options. */
  readonly serveOptions: ServeStdioOptions;
}

/**
 * Start stdio with explicit host-selected services.
 * The transport never chooses a credential source or token-provider strategy.
 * @param {McpStdioOptions} options - Host-owned tool services and transport settings.
 * @returns {ReturnType<typeof serveStdio>} Handle for closing the stdio connection.
 */
export function createStdioTransport(
  options: McpStdioOptions,
): ReturnType<typeof serveStdio> {
  return serveStdio(() => {
    const server = createIracingMcpServer({
      serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
      services: options.services,
    });

    registerReferenceResources(server, options.catalogs ?? []);

    return server;
  }, options.serveOptions);
}
