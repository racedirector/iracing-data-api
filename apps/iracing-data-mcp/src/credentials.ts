import { ApplicationFailure } from "@iracing-data/mcp";
import {
  InMemoryStore,
  OAuthClient,
  OAuthRefreshError,
  OAuthTokenDocumentSessionStore,
  readOAuthTokenDocument,
  type IRacingOAuthClientMetadataInput,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { createFetchQueries } from "./adapters/fetch.js";
import { LocalAuthorizationError } from "./auth-errors.js";
import type { McpCapabilities } from "./composition.js";
import type { AccessTokenProvider } from "./token-provider.js";

/**
 * Validate the selected local document before serving stdio, without refresh.
 * @param {string} credentialsFile - Explicitly selected OAuth token document.
 * @returns {Promise<void>} Completion once usable credential state is present.
 * @throws {LocalAuthorizationError} When credentials are absent or invalid.
 */
export async function validateFileSession(
  credentialsFile: string,
): Promise<void> {
  let token: OAuthTokenResponse | undefined;

  try {
    token = await readOAuthTokenDocument(credentialsFile);
  } catch (error) {
    throw restorationFailure(credentialsFile, error);
  }

  if (!token) {
    throw missingSession(credentialsFile);
  }
}

/**
 * Resolve a file-backed access token on demand without sharing a stale token.
 * Refresh expired sessions and persist rotated credentials; never launch login.
 * @param {string} credentialsFile - Selected OAuth token document path.
 * @param {IRacingOAuthClientMetadataInput} clientMetadata - Registration used for the original login.
 * @returns {AccessTokenProvider} Serialized token provider.
 */
export function createFileAccessTokenProvider(
  credentialsFile: string,
  clientMetadata: IRacingOAuthClientMetadataInput,
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
        throw missingSession(credentialsFile);
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

function missingSession(credentialsFile: string): LocalAuthorizationError {
  const diagnostic = new LocalAuthorizationError(
    `No OAuth session found in ${credentialsFile}. Run pnpm iracing-data auth login --scope iracing.auth, or select an existing token document with --credentials / IRACING_MCP_CREDENTIAL_FILE. See https://github.com/racedirector/iracing-data-api/tree/main/apps/iracing-data-mcp#environment-configuration`,
    new ApplicationFailure("AUTHORIZATION_REQUIRED", {
      reason: "missing_session",
    }),
  );

  process.stderr.write(`[iracing-data-mcp] ${diagnostic.message}\n`);

  return diagnostic;
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
  clientMetadata: IRacingOAuthClientMetadataInput,
): McpCapabilities {
  return createFetchQueries(
    createFileAccessTokenProvider(credentialsFile, clientMetadata),
  );
}
