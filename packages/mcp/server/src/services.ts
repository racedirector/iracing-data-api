/** Request-scoped selection of an account-owned Data API gateway. */
import type { DataApiGateway } from "./gateway/gateway.js";
import type { AuthInfo } from "@modelcontextprotocol/server";

/** Framework-validated ingress identity and cancellation; host policy selects the account. */
export interface DataApiRequestContext {
  readonly authInfo?: AuthInfo;
  readonly signal: AbortSignal;
}

/** The host retains credentials, refresh, persistence and account gateway lifetimes. */
export interface McpServices {
  /** Return the same gateway for the same account to preserve cursors and retention.
   * Use separate gateways for separate accounts; invalidate on account replacement or auth loss.
   * Access failures should be sanitized ApplicationFailure instances.
   */
  readonly getDataApiGateway: (
    context: DataApiRequestContext,
  ) => DataApiGateway | Promise<DataApiGateway>;
}
