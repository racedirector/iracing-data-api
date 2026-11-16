import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { composeMcpServices } from "./composition.js";
import type { McpActor, ResolveCapabilities } from "./composition.js";

/** Explicit host-owned identity and capabilities for a local MCP connection. */
export interface McpStdioOptions {
  /** Identity selected and authorized by the embedding host. */
  readonly actor: McpActor;

  /** Same account/capability selection contract used by HTTP hosting. */
  readonly resolveCapabilities: ResolveCapabilities;
}

/**
 * Start stdio with explicit host-selected identity and capabilities.
 * The transport never chooses a credential source or token-provider strategy.
 * @param {McpStdioOptions} options - Host-owned identity and capability resolution.
 * @returns {ReturnType<typeof serveStdio>} Handle for closing the stdio connection.
 */
export function startMcpStdio(
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
    {
      onerror: () => {
        process.stderr.write("MCP transport error.\n");
      },
    },
  );
}
