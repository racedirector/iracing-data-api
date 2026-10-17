import {
  InMemoryStore,
  InternalState,
  IRacingOAuthClientMetadata,
  OAuthClient,
  OAuthClientOptions,
  OAuthTokenResponse,
} from "@iracing-data/oauth-client";

export interface CreateOAuthClientOptions
  extends
    Pick<
      IRacingOAuthClientMetadata,
      | "clientId"
      | "clientSecret"
      | "redirectUri"
      | "scopes"
      | "username"
      | "password"
    >,
    Pick<OAuthClientOptions, "stateStore" | "sessionStore"> {}

export function createOAuthClient({
  clientId,
  clientSecret,
  redirectUri,
  scopes,
  username,
  password,
  stateStore,
  sessionStore,
}: CreateOAuthClientOptions) {
  return new OAuthClient({
    clientMetadata: {
      clientId,
      clientSecret,
      redirectUri,
      scopes,
      username,
      password,
    },
    stateStore,
    sessionStore,
  });
}
