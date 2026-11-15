import { ApplicationFailure } from "@iracing-data/mcp";
import {
  InMemoryStore,
  OAuthClient,
  OAuthTokenDocumentSessionStore,
  type IRacingOAuthClientMetadataInput,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { createFetchQueries } from "./adapters/fetch.js";
import type { McpCapabilities } from "./composition.js";

/**
 * Read the dedicated CLI MCP credential document when the tool needs a token.
 * Refresh expired sessions and persist rotated credentials; never launch login.
 * @param {string} credentialsFile - Dedicated CLI MCP token document path.
 * @param {IRacingOAuthClientMetadataInput} clientMetadata - Registration used for the original CLI login.
 * @returns {McpCapabilities} Concrete Fetch queries without a shared token cache.
 */
export function createCliCapabilities(
  credentialsFile: string,
  clientMetadata: IRacingOAuthClientMetadataInput = {
    clientId: process.env.IRACING_AUTH_CLIENT ?? "",
    clientSecret: process.env.IRACING_AUTH_SECRET,
    scopes: [],
  },
): McpCapabilities {
  const sessionKey = "iracing-data-mcp-local";

  const store = new OAuthTokenDocumentSessionStore({
    filePath: credentialsFile,
    sessionKey,
  });

  const client = new OAuthClient({
    // The lifecycle client requires authorization-code metadata even for
    // restoration. No authorization request or callback is started here.
    clientMetadata: { redirectUri: "http://127.0.0.1", ...clientMetadata },
    stateStore: new InMemoryStore(),
    sessionStore: store,
  });

  return createFetchQueries(async () => {
    let token: OAuthTokenResponse | undefined;

    try {
      token = await client.restoreSessionForId(sessionKey);
    } catch {
      throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
    }

    if (!token?.access_token.trim()) {
      throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
    }

    return token.access_token;
  });
}
