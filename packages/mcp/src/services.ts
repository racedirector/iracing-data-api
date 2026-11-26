import type { RequestContext } from "./diagnostics/errors.js";
import type { ReferenceQueries } from "./tools/find-reference/service.js";
import type { DriverQueries } from "./tools/get-my-driver/service.js";
import type { RecentRaceQueries } from "./tools/get-recent-races/service.js";
import type { StaticCacheRefresh } from "./tools/refresh-static-cache/service.js";
import type { RaceSearchQueries } from "./tools/search-race-results/service.js";
import type { McpServer, AuthInfo } from "@modelcontextprotocol/server";

/** Only tool registration is needed for an externally constructed MCP server. */
export type IracingToolRegistry = Pick<McpServer, "registerTool">;

/** Request-local cancellation and host-verified identity for capability selection. */
export interface IracingToolContext {
  /** Signal supplied by MCP to cancel this operation. */
  readonly signal: AbortSignal;

  /** Verified ingress identity, when the host supplies one. */
  readonly authInfo?: AuthInfo;

  /** Internal tool-call correlation, when selected through the execution adapter. */
  readonly request?: RequestContext;
}

/** The host selects independently implemented capabilities for each request. */
export interface IracingToolServices {
  /**
   * Optional selector; refresh_static_cache is advertised only when supplied.
   * @param {IracingToolContext} context - Caller cancellation and host context.
   * @returns {StaticCacheRefresh | Promise<StaticCacheRefresh>} Host-owned snapshot maintenance.
   */
  getStaticCacheRefresh?(
    context: IracingToolContext,
  ): StaticCacheRefresh | Promise<StaticCacheRefresh>;

  /**
   * Optional explicit selector; find_reference is advertised only when supplied.
   * @param {IracingToolContext} context - Cancellation and host-selected request context.
   * @returns {ReferenceQueries | Promise<ReferenceQueries>} Host-owned reference lookup.
   */
  getReferenceQueries?(
    context: IracingToolContext,
  ): ReferenceQueries | Promise<ReferenceQueries>;

  /**
   * Select the verified actor's historical search capability.
   * @param {IracingToolContext} context - Cancellation and verified actor context.
   * @returns {RaceSearchQueries | Promise<RaceSearchQueries>} Actor-owned historical search provider.
   */
  getRaceSearchQueries(
    context: IracingToolContext,
  ): RaceSearchQueries | Promise<RaceSearchQueries>;

  /**
   * Selects the principal's driver queries for the current request.
   * @param {IracingToolContext} context - Request-local cancellation and verified ingress identity.
   * @returns {DriverQueries | Promise<DriverQueries>} Driver query implementation chosen for this request.
   */
  getDriverQueries(
    context: IracingToolContext,
  ): DriverQueries | Promise<DriverQueries>;

  /**
   * Selects the principal's recent-race queries for the current request.
   * @param {IracingToolContext} context - Request-local cancellation and verified ingress identity.
   * @returns {RecentRaceQueries | Promise<RecentRaceQueries>} Recent-race provider chosen for this request.
   */
  getRecentRaceQueries(
    context: IracingToolContext,
  ): RecentRaceQueries | Promise<RecentRaceQueries>;
}
