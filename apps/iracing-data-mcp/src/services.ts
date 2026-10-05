import type { Configuration as DataApiConfiguration } from "@iracing-data/api-client-fetch";
import type { OAuthClient } from "@iracing-data/oauth-client";

/**
 * Long-lived application services shared across request-scoped MCP servers.
 *
 * Concrete session restoration and Data API gateway behavior are added by their
 * owning slices; this interface only establishes the dependency boundary.
 */
export interface McpServices {
  readonly oauthClient: OAuthClient;
  readonly dataApiConfiguration: DataApiConfiguration;
}
