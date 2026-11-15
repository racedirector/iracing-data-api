import type { IracingToolServices } from "@iracing-data/mcp";
import type { McpServer } from "@modelcontextprotocol/server";

/** Reference host health state; credential ownership stays in the app. */
export type AuthorizationState =
  "ready" | "authorization_required" | "configuration_error";

/** Tool selectors and local-owner lifecycle exposed to the HTTP transport. */
export interface McpServices extends IracingToolServices {
  /**
   * Reports the current credential owner authorization status.
   * @returns {AuthorizationState} Current authorization readiness reported by the credential owner.
   */
  readonly authorizationState?: () => AuthorizationState;

  /**
   * Releases the credential owner during host shutdown.
   * @returns {Promise<void>} Completion of the requested operation.
   */
  readonly shutdownAuthorizationOwner?: () => Promise<void>;
}

/**
 * Optional caller tool registration used by the host's integration tests.
 * @param {McpServer} server - Caller-owned MCP tool registration capability.
 * @param {McpServices} services - Host-owned API access and continuation services.
 */
export type McpToolRegistrar = (
  server: McpServer,
  services: McpServices,
) => void;
