import { createIracingMcpServer } from "@iracing-data/mcp";
import { createMcpHandler } from "@modelcontextprotocol/server";
import type { IracingToolServices } from "@iracing-data/mcp";
import type {
  CreateMcpHandlerOptions,
  McpHttpHandler,
} from "@modelcontextprotocol/server";

/** Host-selected services for a path-independent MCP HTTP handler. */
export interface HttpTransportOptions {
  /** Tool services selected by the embedding host. This handler does not authenticate callers. */
  readonly services: IracingToolServices;

  /** HTTP handler options. */
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
