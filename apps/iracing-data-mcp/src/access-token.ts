import { ApplicationFailure } from "@iracing-data/mcp";
import { InMemoryStore, OAuthClient } from "@iracing-data/oauth-client";
import { LocalAuthorizationError } from "./auth-errors.js";
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
    Pick<OAuthClientOptions, "sessionStore"> {
  /** Credential owner's storage key, shared with the injected session store. */
  readonly sessionKey: string;
}

/**
 * Creates a token provider, utilizing `@iracing-data/oauth-client` for transport and storage
 * mechanisms. One provider retains one client/store lifecycle across requests;
 * restoration failures propagate unchanged and this provider never logs them.
 * @param {CreateTokenProviderOptions} options - Provides OAuth client metadata and storage overrides.
 * @returns {AccessTokenProvider} A provider for retrieving an access token.
 * @throws {TypeError} If the selected session key is blank.
 */
export function createTokenProvider(options: CreateTokenProviderOptions) {
  const { sessionKey } = options;

  if (!sessionKey.trim()) {
    throw new TypeError("Token provider session key must be nonempty.");
  }

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
   * its access token or throw an error.
   */
  return async () => {
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
