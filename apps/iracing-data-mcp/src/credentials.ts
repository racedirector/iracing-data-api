import { ApplicationFailure } from "@iracing-data/mcp";
import {
  InMemoryStore,
  OAuthClient,
  OAuthRefreshError,
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

  // Serialize restoration through durable refresh persistence, not API requests.
  // Each operation gets a fresh store so external CLI logins are observed.
  let restorationTail: Promise<void> = Promise.resolve();

  return createFetchQueries(async () => {
    const restoration = restorationTail.then(async () => {
      const store = new OAuthTokenDocumentSessionStore({
        filePath: credentialsFile,
        sessionKey,
      });

      const client = new OAuthClient({
        clientMetadata: { redirectUri: "http://127.0.0.1", ...clientMetadata },
        stateStore: new InMemoryStore(),
        sessionStore: store,
      });

      let token: OAuthTokenResponse | undefined;

      try {
        token = await client.restoreSessionForId(sessionKey);
      } catch (error) {
        throw new ApplicationFailure(
          error instanceof OAuthRefreshError
            ? "TOKEN_REFRESH_FAILED"
            : "AUTHORIZATION_REQUIRED",
        );
      }

      if (!token?.access_token.trim()) {
        throw new ApplicationFailure("AUTHORIZATION_REQUIRED", {
          reason: "missing_session",
        });
      }

      return token.access_token;
    });

    restorationTail = restoration.then(
      () => undefined,
      () => undefined,
    );

    return restoration;
  });
}
