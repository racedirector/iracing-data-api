import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createMcpRouter } from "./http.js";
import type { McpConfig } from "./config.js";
import type { McpRouterOptions } from "./http.js";

/** Standalone HTTP listener configuration; embedding hosts use createMcpRouter. */
export interface HttpServerOptions extends McpRouterOptions {
  /** Validated listener configuration. */
  readonly config: Pick<McpConfig, "host" | "port">;
}

/**
 * Mount the Hono router and start a Node HTTP listener.
 * @param {HttpServerOptions} options - Listener and host-owned dependencies.
 * @returns {ReturnType<typeof serve>} Node server; the caller manages shutdown.
 */
export function startMcpHttpServer(
  options: HttpServerOptions,
): ReturnType<typeof serve> {
  const app = new Hono().route("/mcp", createMcpRouter(options));

  return serve({
    fetch: app.fetch,
    hostname: options.config.host,
    port: options.config.port,
  });
}
