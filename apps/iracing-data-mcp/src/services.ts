import type { Configuration } from "@iracing-data/api-client-fetch";
import type { IracingToolServices } from "@iracing-data/mcp-tools";
import type { OAuthClient } from "@iracing-data/oauth-client";
import type { McpServer } from "@modelcontextprotocol/server";

/** Reference host health state; credential ownership stays in the app. */
export type AuthorizationState =
  "ready" | "authorization_required" | "configuration_error";

/** Process-owned credentials and tool access shared by logical MCP sessions. */
export interface McpServices extends IracingToolServices {
  readonly authorizationState?: () => AuthorizationState;
  readonly shutdownAuthorizationOwner?: () => Promise<void>;
  readonly oauthClient: OAuthClient;
  readonly dataApiConfiguration: Configuration;
}

/** Optional caller tool registration used by the host's integration tests. */
export type McpToolRegistrar = (
  server: McpServer,
  services: McpServices,
) => void;
