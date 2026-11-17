import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from "@modelcontextprotocol/server";
import { Hono } from "hono";
import { createHttpTransport } from "../transports/http/index.js";
import type { IracingMcpServerOptions } from "@iracing-data/mcp";

/** Dependencies selected by the standalone host. */
export type McpRouterOptions = Pick<
  IracingMcpServerOptions,
  "services" | "catalogs" | "assets" | "documents"
>;

/**
 * Mount the standalone application's MCP endpoint; embedding hosts choose their own path.
 * @param {McpRouterOptions} options - Host-selected tool services.
 * @returns {Hono} Application router.
 */
export function createMcpRouter(options: McpRouterOptions): Hono {
  const router = new Hono();

  const handler = createHttpTransport({
    services: options.services,
    catalogs: options.catalogs,
    documents: options.documents,
    assets: options.assets,
    serveOptions: { maxRequestBodySize: 64 * 1024 },
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
