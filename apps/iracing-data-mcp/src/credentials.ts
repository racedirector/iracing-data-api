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
 * Resolve a local CLI access token on demand without sharing a stale token.
 * Refresh expired sessions and persist rotated credentials; never launch login.
 * @param {string} credentialsFile - Dedicated CLI MCP token document path.
 * @param {IRacingOAuthClientMetadataInput} clientMetadata - Registration used for the original CLI login.
 * @returns {() => Promise<string>} Serialized token resolver.
 */
export function createCliAccessToken(
  credentialsFile: string,
  clientMetadata: IRacingOAuthClientMetadataInput = {
    clientId: process.env.IRACING_AUTH_CLIENT ?? "",
    clientSecret: process.env.IRACING_AUTH_SECRET,
    scopes: [],
  },
): () => Promise<string> {
  const sessionKey = "iracing-data-mcp-local";

  // Serialize restoration through durable refresh persistence, not API requests.
  // Each operation gets a fresh store so external CLI logins are observed.
  let restorationTail: Promise<void> = Promise.resolve();

  return async () => {
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
        // Local stdio diagnostics must retain the OAuth service's explanation.
        // Do not serialize the error object: it may carry sensitive context.
        const detail =
          error instanceof Error
            ? error.message
            : "Unknown restoration failure";

        const code =
          error && typeof error === "object" && "code" in error
            ? String(error.code)
            : undefined;

        process.stderr.write(
          `[iracing-data-mcp] OAuth session restoration failed (${credentialsFile})${code ? ` [${code}]` : ""}: ${detail}\n`,
        );
        throw error;
      }

      if (!token?.access_token.trim()) {
        const error = new Error(
          `No OAuth session found in ${credentialsFile}. Authenticate the CLI MCP session or select its credential document with --credentials / IRACING_MCP_CREDENTIAL_FILE.`,
        );

        process.stderr.write(`[iracing-data-mcp] ${error.message}\n`);
        throw error;
      }

      return token.access_token;
    });

    restorationTail = restoration.then(
      () => undefined,
      () => undefined,
    );

    return restoration;
  };
}

/**
 * Compose the current local CLI capabilities around a single token resolver.
 * @param {string} credentialsFile - Selected OAuth token document.
 * @param {IRacingOAuthClientMetadataInput} clientMetadata - Registration used for the original login.
 * @returns {McpCapabilities} Local API capabilities sharing one serialized token resolver.
 */
export function createCliCapabilities(
  credentialsFile: string,
  clientMetadata?: IRacingOAuthClientMetadataInput,
): McpCapabilities {
  return createFetchQueries(
    createCliAccessToken(credentialsFile, clientMetadata),
  );
}
