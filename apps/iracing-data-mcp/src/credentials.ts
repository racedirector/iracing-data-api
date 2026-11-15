import { ApplicationFailure } from "@iracing-data/mcp";
import { OAuthTokenDocumentSessionStore } from "@iracing-data/oauth-client";
import { createFetchQueries } from "./adapters/fetch.js";
import type { McpCapabilities } from "./composition.js";

/**
 * Read the dedicated CLI MCP credential document when the tool needs a token.
 * Login/refresh is an external CLI responsibility; this host never launches OAuth.
 * @param {string} credentialsFile - Dedicated CLI MCP token document path.
 * @returns {McpCapabilities} Concrete Fetch queries without a shared token cache.
 */
export function createCliCapabilities(
  credentialsFile: string,
): McpCapabilities {
  const sessionKey = "iracing-data-mcp-local";

  const store = new OAuthTokenDocumentSessionStore({
    filePath: credentialsFile,
    sessionKey,
  });

  return createFetchQueries(async () => {
    const token = await store.get(sessionKey);

    if (!token?.access_token.trim()) {
      throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
    }

    return token.access_token;
  });
}
