import { Hono } from "hono";
import { createHttpTransport } from "../transports/http/index.js";
import type { IracingToolServices } from "@iracing-data/mcp";

/** Dependencies selected by the standalone host. */
export interface McpRouterOptions {
  /** Tool services for the host-selected account. */
  readonly services: IracingToolServices;
}

/**
 * Mount the standalone application's MCP endpoint; embedding hosts choose their own path.
 * @param {McpRouterOptions} options - Host-selected tool services.
 * @returns {Hono} Application router.
 */
export function createMcpRouter(options: McpRouterOptions): Hono {
  const router = new Hono();

  const handler = createHttpTransport({
    services: options.services,
    serveOptions: { maxRequestBodySize: 64 * 1024 },
  });

  router.all("/mcp", (context) => handler.fetch(context.req.raw));
  router.notFound(() => new Response(null, { status: 404 }));

  return router;
}
