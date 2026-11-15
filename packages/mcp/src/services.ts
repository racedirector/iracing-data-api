import type { DriverQueries } from "./tools/get-my-driver/service.js";
import type { RecentRaceQueries } from "./tools/get-recent-races/service.js";
import type { McpServer, AuthInfo } from "@modelcontextprotocol/server";

/** Only tool registration is needed for an externally constructed MCP server. */
export type IracingToolRegistry = Pick<McpServer, "registerTool">;

/** Request-local cancellation and host-verified identity for capability selection. */
export interface IracingToolContext {
  readonly signal: AbortSignal;
  readonly authInfo?: AuthInfo;
}

/** The host selects independently implemented capabilities for each request. */
export interface IracingToolServices {
  getDriverQueries?(
    context: IracingToolContext,
  ): DriverQueries | Promise<DriverQueries>;
  getRecentRaceQueries?(
    context: IracingToolContext,
  ): RecentRaceQueries | Promise<RecentRaceQueries>;
}
