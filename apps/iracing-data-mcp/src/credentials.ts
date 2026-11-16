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
import { LocalAuthorizationError } from "./auth-errors.js";
import type { McpCapabilities } from "./composition.js";
import type { AccessTokenProvider } from "./token-provider.js";

/**
 * Resolve a file-backed access token on demand without sharing a stale token.
 * Refresh expired sessions and persist rotated credentials; never launch login.
 * @param {string} credentialsFile - Selected OAuth token document path.
 * @param {IRacingOAuthClientMetadataInput} clientMetadata - Registration used for the original login.
 * @returns {AccessTokenProvider} Serialized token provider.
 */
export function createFileAccessTokenProvider(
  credentialsFile: string,
  clientMetadata: IRacingOAuthClientMetadataInput = {
    clientId: process.env.IRACING_AUTH_CLIENT ?? "",
    clientSecret: process.env.IRACING_AUTH_SECRET,
    scopes: [],
  },
): AccessTokenProvider {
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
        throw restorationFailure(credentialsFile, error);
      }

      if (!token?.access_token.trim()) {
        const failure = new ApplicationFailure("AUTHORIZATION_REQUIRED", {
          reason: "missing_session",
        });

        const diagnostic = new LocalAuthorizationError(
          `No OAuth session found in ${credentialsFile}. Authenticate an iRacing session (for example with the CLI) or select its credential document with --credentials / IRACING_MCP_CREDENTIAL_FILE.`,
          failure,
        );

        process.stderr.write(`[iracing-data-mcp] ${diagnostic.message}\n`);
        throw diagnostic;
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

function restorationFailure(
  credentialsFile: string,
  error: unknown,
): LocalAuthorizationError {
  const failure = new ApplicationFailure(
    error instanceof OAuthRefreshError
      ? "TOKEN_REFRESH_FAILED"
      : "AUTHORIZATION_REQUIRED",
  );

  const detail =
    error instanceof Error ? error.message : "Unknown restoration failure";

  const code =
    error && typeof error === "object" && "code" in error
      ? ` [${String(error.code)}]`
      : "";

  const description =
    error instanceof OAuthRefreshError && error.description
      ? `: ${error.description}`
      : "";

  const diagnostic = new LocalAuthorizationError(
    `OAuth session restoration failed (${credentialsFile})${code}: ${detail}${description}`,
    failure,
    error,
  );

  process.stderr.write(`[iracing-data-mcp] ${diagnostic.message}\n`);

  return diagnostic;
}

/**
 * Compose file-backed capabilities around a single token provider.
 * @param {string} credentialsFile - Selected OAuth token document.
 * @param {IRacingOAuthClientMetadataInput} clientMetadata - Registration used for the original login.
 * @returns {McpCapabilities} Local API capabilities sharing one serialized token resolver.
 */
export function createFileCapabilities(
  credentialsFile: string,
  clientMetadata?: IRacingOAuthClientMetadataInput,
): McpCapabilities {
  return createFetchQueries(
    createFileAccessTokenProvider(credentialsFile, clientMetadata),
  );
}
