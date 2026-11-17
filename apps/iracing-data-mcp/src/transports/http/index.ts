import { createIracingMcpServer } from "@iracing-data/mcp";
import { createMcpHandler } from "@modelcontextprotocol/server";
import type { IracingToolServices } from "@iracing-data/mcp";
import type {
  CreateMcpHandlerOptions,
  McpHttpHandler,
} from "@modelcontextprotocol/server";

/** Explicit host-owned identity and capabilities for a local MCP connection. */
export interface HttpTransportOptions {
  /** Identity selected and authorized by the embedding host. */
  readonly services: IracingToolServices;

  /** Stdio server options. */
  readonly serveOptions: CreateMcpHandlerOptions;
}

/**
 * Creates an HTTP transport handler.
 * @param {HttpTransportOptions} options - Options for creating the request handler.
 * @returns {McpHttpHandler} - HTTP handler.
 */
export function createHttpTransport(
  options: HttpTransportOptions,
): McpHttpHandler {
  return createMcpHandler(
    () =>
      createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services: options.services,
      }),
    options.serveOptions,
  );
}
