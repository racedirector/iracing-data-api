import type { Configuration } from "@iracing-data/api-client-fetch";
import type { IracingToolServices } from "@iracing-data/mcp-tools";
import type { OAuthClient } from "@iracing-data/oauth-client";
import type { McpServer } from "@modelcontextprotocol/server";

/** Reference host health state; credential ownership stays in the app. */
export type AuthorizationState =
  "ready" | "authorization_required" | "configuration_error";

/** Process-owned credentials and tool access shared by logical MCP sessions. */
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

  /** Authored OAuth lifecycle owner used by the local host. */
  readonly oauthClient: OAuthClient;

  /** Generated Data API client configuration for authenticated requests. */
  readonly dataApiConfiguration: Configuration;
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
