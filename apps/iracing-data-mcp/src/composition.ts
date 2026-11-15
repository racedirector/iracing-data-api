import { asValue, createContainer } from "awilix";
import type {
  DriverQueries,
  IracingToolContext,
  IracingToolServices,
  RecentRaceQueries,
} from "@iracing-data/mcp";

/** Principal verified by the HTTP host or fixed for local stdio. */
export interface McpActor {
  /** Actor ID in the host's identity provider. */
  readonly id: string;

  /** Host-owned provider namespace for the verified identity. */
  readonly provider: string;
}

/** The two domain capabilities required by the MCP server. */
export interface McpCapabilities {
  /** Actor-scoped driver lookup. */
  readonly driverQueries: DriverQueries;

  /** Actor-scoped recent-race lookup. */
  readonly recentRaceQueries: RecentRaceQueries;
}

/**
 * An HTTP host authenticates each Request (for example using Better Auth).
 * @param {Request} request - Raw incoming HTTP request.
 * @returns {Promise<McpActor | null> | McpActor | null} Verified actor or null.
 */
export type ResolveActor = (
  request: Request,
) => Promise<McpActor | null> | McpActor | null;

/**
 * Select actor-specific data capabilities; the host owns credential resolution.
 * @param {McpActor} actor - Previously verified caller.
 * @param {IracingToolContext} context - Operation cancellation and MCP context.
 * @returns {Promise<McpCapabilities> | McpCapabilities} Actor-owned query services.
 */
export type ResolveCapabilities = (
  actor: McpActor,
  context: IracingToolContext,
) => Promise<McpCapabilities> | McpCapabilities;

/**
 * Compose the two MCP tool selectors using injected dependencies.
 * @param {McpActor} actor - Host-verified actor or local stdio identity.
 * @param {ResolveCapabilities} resolveCapabilities - Host-owned account and data resolver.
 * @returns {IracingToolServices} Explicit tool services for the MCP factory.
 */
export function composeMcpServices(
  actor: McpActor,
  resolveCapabilities: ResolveCapabilities,
): IracingToolServices {
  const container = createContainer().register({
    actor: asValue(actor),
    resolveCapabilities: asValue(resolveCapabilities),
  });

  async function select(context: IracingToolContext): Promise<McpCapabilities> {
    context.signal.throwIfAborted();

    const resolved = await container.cradle.resolveCapabilities(
      container.cradle.actor,
      context,
    );

    context.signal.throwIfAborted();

    return resolved;
  }

  return {
    getDriverQueries: async (context) => (await select(context)).driverQueries,
    getRecentRaceQueries: async (context) =>
      (await select(context)).recentRaceQueries,
  };
}
