import { ApplicationFailure } from "@iracing-data/mcp";
import { asValue, createContainer } from "awilix";
import type {
  DriverQueries,
  IracingToolContext,
  IracingToolServices,
  RecentRaceQueries,
  RaceSearchQueries,
} from "@iracing-data/mcp";

/** Principal verified by the HTTP host or fixed for local stdio. */
export interface McpActor {
  /** Actor ID in the host's identity provider. */
  readonly id: string;

  /** Host-owned provider namespace for the verified identity. */
  readonly provider: string;
}

/** Actor-owned domain capabilities exposed by the MCP server. */
export interface McpCapabilities {
  /** Actor-scoped historical session search. */
  readonly raceSearchQueries: RaceSearchQueries;

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
 * Compose explicit MCP tool selectors using injected dependencies.
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

  return createMcpServices(async (context) =>
    container.cradle.resolveCapabilities(container.cradle.actor, context),
  );
}

/**
 * Compose tool services from host-selected capabilities, without choosing identity.
 * @param {(context: IracingToolContext) => Promise<McpCapabilities> | McpCapabilities} resolveCapabilities - Host-owned capability selection.
 * @returns {IracingToolServices} Explicit MCP tool services.
 */
export function createMcpServices(
  resolveCapabilities: (
    context: IracingToolContext,
  ) => Promise<McpCapabilities> | McpCapabilities,
): IracingToolServices {
  async function select(context: IracingToolContext): Promise<McpCapabilities> {
    context.signal.throwIfAborted();

    const resolved = await resolveCapabilities(context);

    context.signal.throwIfAborted();

    return resolved;
  }

  return {
    getRaceSearchQueries: async (context) => {
      // The host callback may be untyped at runtime despite its TS contract.
      const candidate: unknown = (await select(context)).raceSearchQueries;

      if (
        !candidate ||
        typeof candidate !== "object" ||
        !("search" in candidate) ||
        typeof candidate.search !== "function"
      ) {
        throw new ApplicationFailure("CONFIGURATION_ERROR");
      }

      return candidate as RaceSearchQueries;
    },
    getDriverQueries: async (context) => (await select(context)).driverQueries,
    getRecentRaceQueries: async (context) =>
      (await select(context)).recentRaceQueries,
  };
}
