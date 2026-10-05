import type { AuthorizationState } from "./session.js";
import type { Configuration as DataApiConfiguration } from "@iracing-data/api-client-fetch";
import type { OAuthClient } from "@iracing-data/oauth-client";

/**
 * Long-lived application services shared across request-scoped MCP servers.
 *
 * Durable session restoration is composed once by createMcpServices.
 * Data API gateway behavior remains owned by its following slice.
 */
export interface McpServices {
  readonly authorizationState?: () => AuthorizationState;
  readonly oauthClient: OAuthClient;
  readonly dataApiConfiguration: DataApiConfiguration;
}
