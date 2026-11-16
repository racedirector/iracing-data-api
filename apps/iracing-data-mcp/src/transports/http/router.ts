import { createIracingMcpServer } from "@iracing-data/mcp";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Hono } from "hono";
import { composeMcpServices } from "../../composition.js";
import type { ResolveActor, ResolveCapabilities } from "../../composition.js";

/** Dependencies supplied by the embedding HTTP host. */
export interface McpRouterOptions {
  /** Authenticate the request before allowing MCP tool access. */
  readonly resolveActor: ResolveActor;

  /** Find the authenticated actor's linked iRacing query implementations. */
  readonly resolveCapabilities: ResolveCapabilities;
}

/**
 * Create a mountable Hono router. The caller owns the HTTP listener and auth.
 * Example: app.route("/mcp", createMcpRouter({ resolveActor, resolveCapabilities })).
 * @param {McpRouterOptions} options - Host-provided actor and data resolvers.
 * @returns {Hono} Router with the MCP HTTP endpoint.
 */
export function createMcpRouter(options: McpRouterOptions): Hono {
  const router = new Hono();

  router.all("/", async (context) => {
    const actor = await options.resolveActor(context.req.raw);

    if (!actor) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const services = composeMcpServices(actor, options.resolveCapabilities);

    const handler = createMcpHandler(
      () =>
        createIracingMcpServer({
          serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
          services,
        }),
      { maxRequestBodySize: 64 * 1024 },
    );

    return handler.fetch(context.req.raw);
  });

  return router;
}
