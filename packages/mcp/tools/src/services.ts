import type { Configuration } from "@iracing-data/api-client-fetch";
import type { McpServer, AuthInfo } from "@modelcontextprotocol/server";

/** Only the registration capability is required from a caller-owned server. */
export type IracingToolRegistry = Pick<McpServer, "registerTool">;

/** Request-local cancellation and optional ingress authentication for host selection. */
export interface IracingToolContext {
  readonly signal: AbortSignal;
  readonly authInfo?: AuthInfo;
}

/** Generated execution configuration and opaque retained-continuation isolation. */
export interface IracingDataAccess {
  readonly configuration: Configuration;
  readonly continuationScope: object;
}

/** The host owns credentials and selects access; tools interpret no claims. */
export interface IracingToolServices {
  getDataApiAccess(
    context: IracingToolContext,
  ): IracingDataAccess | Promise<IracingDataAccess>;
}
