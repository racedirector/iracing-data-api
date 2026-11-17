import {
  createMcpHandler,
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from "@modelcontextprotocol/server";
import { Hono } from "hono";
import type { McpServer } from "@modelcontextprotocol/server";

/** Dependencies selected by the standalone host. */
export interface McpRouterOptions {
  /** The server to use for requests. */
  server: McpServer;
}

/**
 * Mount the standalone application's MCP endpoint; embedding hosts choose their own path.
 * @param {McpRouterOptions} options - Host-selected tool services.
 * @returns {Hono} Application router.
 */
export function createMcpRouter(options: McpRouterOptions): Hono {
  const router = new Hono();

  const handler = createMcpHandler(() => options.server, {
    maxRequestBodySize: 64 * 1024,
  });

  router.all("/mcp", (context) => {
    const request = context.req.raw;

    const rejected =
      hostHeaderValidationResponse(request, localhostAllowedHostnames()) ??
      originValidationResponse(request, localhostAllowedOrigins());

    return rejected ?? handler.fetch(request);
  });
  router.notFound(() => new Response(null, { status: 404 }));

  return router;
}
