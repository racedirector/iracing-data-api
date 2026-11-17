import { ApplicationFailure } from "@iracing-data/mcp";
import { InMemoryStore, OAuthClient } from "@iracing-data/oauth-client";
import { LocalAuthorizationError } from "../auth-errors.js";
import type { AccessTokenProvider } from "../token-provider.js";
import type {
  IRacingOAuthClientMetadataInput,
  OAuthClientOptions,
} from "@iracing-data/oauth-client";

/**
 * Options for creating a token provider.
 */
export interface CreateTokenProviderOptions
  extends
    Pick<
      IRacingOAuthClientMetadataInput,
      | "clientId"
      | "clientSecret"
      | "maskedClientSecret"
      | "scopes"
      | "username"
      | "password"
      | "maskedPassword"
      | "redirectUri"
    >,
    Pick<OAuthClientOptions, "sessionStore"> {}

/**
 * Creates a token provider, utilizing `@iracing-data/oauth-client` for transport and storage
 * mechanisms.
 * @param {CreateTokenProviderOptions} options - Provides OAuth client metadata and storage overrides.
 * @returns {AccessTokenProvider} A provider for retrieving an access token.
 */
export function createTokenProvider(
  options: CreateTokenProviderOptions,
): AccessTokenProvider {
  const client = new OAuthClient({
    clientMetadata: {
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      maskedClientSecret: options.maskedClientSecret,
      scopes: options.scopes,
      username: options.username,
      password: options.password,
      maskedPassword: options.maskedPassword,
      redirectUri: options.redirectUri ?? "http://127.0.0.1",
    },
    stateStore: new InMemoryStore(),
    sessionStore: options.sessionStore,
  });

  /**
   * Attempt to restore a session for the provided session key and return
   * it's access token or throw an error.
   */
  return async (sessionKey = "iracing-data-mcp") => {
    const token = await client.restoreSessionForId(sessionKey);

    if (!token?.access_token.trim()) {
      throw new LocalAuthorizationError(
        `No OAuth session found.`,
        new ApplicationFailure("AUTHORIZATION_REQUIRED", {
          reason: "missing_session",
        }),
      );
    }

    return token.access_token;
  };
}
