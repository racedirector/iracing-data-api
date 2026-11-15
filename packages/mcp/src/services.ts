import type { DriverQueries } from "./tools/get-my-driver/service.js";
import type { RecentRaceQueries } from "./tools/get-recent-races/service.js";
import type { McpServer, AuthInfo } from "@modelcontextprotocol/server";

/** Only tool registration is needed for an externally constructed MCP server. */
export type IracingToolRegistry = Pick<McpServer, "registerTool">;

/** Request-local cancellation and host-verified identity for capability selection. */
export interface IracingToolContext {
  /** Signal supplied by MCP to cancel this operation. */
  readonly signal: AbortSignal;
  /** Verified ingress identity, when the host supplies one. */
  readonly authInfo?: AuthInfo;
}

/** The host selects independently implemented capabilities for each request. */
export interface IracingToolServices {
  /** Selects the principal's driver queries for the current request. */
  getDriverQueries?(
    context: IracingToolContext,
  ): DriverQueries | Promise<DriverQueries>;
  /** Selects the principal's recent-race queries for the current request. */
  getRecentRaceQueries?(
    context: IracingToolContext,
  ): RecentRaceQueries | Promise<RecentRaceQueries>;
}
