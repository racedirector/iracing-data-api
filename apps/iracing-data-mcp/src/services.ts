import type { McpServices } from "@iracing-data/mcp-server";

/** Host health state; it does not select an upstream account for package tools. */
export type AuthorizationState =
  "ready" | "authorization_required" | "configuration_error";

/** HTTP/process lifecycle capabilities remain owned by the application. */
export interface ApplicationServices extends McpServices {
  readonly authorizationState?: () => AuthorizationState;
  readonly shutdownAuthorizationOwner?: () => Promise<void>;
}
