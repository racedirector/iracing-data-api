import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { composeMcpServices } from "../../composition.js";
import type { McpActor, ResolveCapabilities } from "../../composition.js";
import type { ServeStdioOptions } from "@modelcontextprotocol/server/stdio";

/** Explicit host-owned identity and capabilities for a local MCP connection. */
export interface McpStdioOptions {
  /** Identity selected and authorized by the embedding host. */
  readonly actor: McpActor;

  /** Same account/capability selection contract used by HTTP hosting. */
  readonly resolveCapabilities: ResolveCapabilities;

  /** Stdio server options. */
  readonly serveOptions: ServeStdioOptions;
}

/**
 * Start stdio with explicit host-selected identity and capabilities.
 * The transport never chooses a credential source or token-provider strategy.
 * @param {McpStdioOptions} options - Host-owned identity and capability resolution.
 * @returns {ReturnType<typeof serveStdio>} Handle for closing the stdio connection.
 */
export function createStdioTransport(
  options: McpStdioOptions,
): ReturnType<typeof serveStdio> {
  const services = composeMcpServices(
    options.actor,
    options.resolveCapabilities,
  );

  return serveStdio(
    () =>
      createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services,
      }),
    options.serveOptions,
  );
}
