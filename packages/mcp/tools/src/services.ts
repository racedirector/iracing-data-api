import type { Configuration } from "@iracing-data/api-client-fetch";
import type { McpServer, AuthInfo } from "@modelcontextprotocol/server";

/** Only the registration capability is required from a caller-owned server. */
export type IracingToolRegistry = Pick<McpServer, "registerTool">;

/** Request-local cancellation and optional ingress authentication for host selection. */
export interface IracingToolContext {
  /** Cancels upstream work for this request when the caller disconnects or aborts. */
  readonly signal: AbortSignal;

  /** Verified ingress identity supplied by the host; absent for unauthenticated local transport. */
  readonly authInfo?: AuthInfo;
}

/** Generated execution configuration and opaque retained-continuation isolation. */
export interface IracingDataAccess {
  /** Caller-owned generated-client configuration carrying endpoint, transport, and credential policy. */
  readonly configuration: Configuration;

  /** Opaque owner identity isolating retained cursors and replay state between accounts. */
  readonly continuationScope: object;
}

/** The host owns credentials and selects access; tools interpret no claims. */
export interface IracingToolServices {
  /**
   * Selects credentials and continuation ownership for one request without interpreting claims in tools.
   * @param {IracingToolContext} context - Request cancellation and verified ingress identity used by the host.
   * @returns {IracingDataAccess | Promise<IracingDataAccess>} Generated-client access and the identity that owns retained continuations.
   */
  getDataApiAccess(
    context: IracingToolContext,
  ): IracingDataAccess | Promise<IracingDataAccess>;
}
