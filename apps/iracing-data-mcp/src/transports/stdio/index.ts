import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import type { IracingMcpServerOptions } from "@iracing-data/mcp";
import type { ServeStdioOptions } from "@modelcontextprotocol/server/stdio";

/** Host-selected services for a local MCP connection. */
export interface McpStdioOptions extends Pick<
  IracingMcpServerOptions,
  "services" | "catalogs" | "assets" | "documents"
> {
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
  return serveStdio(
    () =>
      createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services: options.services,
        catalogs: options.catalogs,
        documents: options.documents,
        assets: options.assets,
      }),
    options.serveOptions,
  );
}
