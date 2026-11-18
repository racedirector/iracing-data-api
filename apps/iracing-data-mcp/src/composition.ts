import { ApplicationFailure } from "@iracing-data/mcp";
import type {
  DriverQueries,
  IracingToolContext,
  IracingToolServices,
  RecentRaceQueries,
  RaceSearchQueries,
  ReferenceQueries,
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

/** Explicit constructors for one credential owner's lazily selected query adapters. */
export type McpQueryFactories = {
  [Key in keyof McpCapabilities]: () => McpCapabilities[Key];
};

/**
 * Memoized query adapters for one credential owner. Request context and token
 * values are never cached here; the injected adapters retain their token provider.
 */
export class McpServices implements McpCapabilities {
  private driver?: DriverQueries;
  private recentRaces?: RecentRaceQueries;
  private raceSearch?: RaceSearchQueries;

  /**
   * Retain constructors without creating adapters or acquiring credentials.
   * @param {McpQueryFactories} factories - Query constructors bound to one credential owner.
   */
  constructor(private readonly factories: McpQueryFactories) {}

  /**
   * Select the owner's driver adapter, constructing it on first access.
   * @returns {DriverQueries} Memoized driver query adapter.
   */
  get driverQueries(): DriverQueries {
    return (this.driver ??= this.factories.driverQueries());
  }

  /**
   * Select the owner's recent-race adapter, constructing it on first access.
   * @returns {RecentRaceQueries} Memoized recent-race query adapter.
   */
  get recentRaceQueries(): RecentRaceQueries {
    return (this.recentRaces ??= this.factories.recentRaceQueries());
  }

  /**
   * Select the owner's historical-search adapter, constructing it on first access.
   * @returns {RaceSearchQueries} Memoized historical-search query adapter.
   */
  get raceSearchQueries(): RaceSearchQueries {
    return (this.raceSearch ??= this.factories.raceSearchQueries());
  }
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
  return createMcpServices((context) => resolveCapabilities(actor, context));
}

/** Host-selected capabilities, or an explicit request-local capability resolver. */
export type McpCapabilitySource =
  | McpCapabilities
  | ((
      context: IracingToolContext,
    ) => Promise<McpCapabilities> | McpCapabilities);

/**
 * Compose tool services from host-selected capabilities, without choosing identity.
 * @param {McpCapabilitySource} source - One owner's capabilities or host-owned request-local selection.
 * @param {ReferenceQueries} references - Optional reference access bound to this host/credential owner.
 * @returns {IracingToolServices} Explicit MCP tool services.
 */
export function createMcpServices(
  source: McpCapabilitySource,
  references?: ReferenceQueries,
): IracingToolServices {
  async function select(context: IracingToolContext): Promise<McpCapabilities> {
    context.signal.throwIfAborted();

    const resolved =
      typeof source === "function" ? await source(context) : source;

    context.signal.throwIfAborted();

    return resolved;
  }

  return {
    ...(references
      ? {
          getReferenceQueries: (context: IracingToolContext) => {
            context.signal.throwIfAborted();

            return references;
          },
        }
      : {}),
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
