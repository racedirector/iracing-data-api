import {
  OAuthTokenResponseSchema,
  OAuthTokenResponse,
  OAuthPasswordLimitedGrantParametersSchema,
} from "@iracing-data/oauth-schema";
import * as oauth from "oauth4webapi";
import { OAuthApiClient, type OAuthApiClientFactory } from "./api-client";
import { ClientMetadataError, SessionNotFoundError } from "./errors";
import { OAuthCallbackError, OAuthRefreshError } from "./errors/oauth";
import {
  IRacingOAuthClientMetadata,
  IRacingOAuthClientMetadataInput,
  IRacingOAuthClientMetadataSchema,
  SessionStore,
  StateStore,
} from "./schema";
import {
  AccessTokenValidationOptions,
  decodeAccessToken,
  isAccessTokenExpired,
  maskSecret,
  validateAccessToken as validateDecodedAccessToken,
} from "./utils";

// oauth4webapi validates token_type and normalizes it to lowercase. Restore
// the public schema representation only after dependency processing.
function parseProcessedTokenResponse(result: oauth.TokenEndpointResponse) {
  return OAuthTokenResponseSchema.parseAsync({
    ...result,
    token_type: result.token_type === "bearer" ? "Bearer" : result.token_type,
  });
}

export type OAuthClientOptions = {
  // Config
  clientMetadata: Readonly<IRacingOAuthClientMetadataInput>;

  // Stores
  stateStore: StateStore;
  sessionStore: SessionStore;

  // Low-level iRacing OAuth API dependency. The default uses the generated
  // wire client while tests or applications may inject a compatible boundary.
  createOAuthApi?: OAuthApiClientFactory;
};

/**
 * The `OAuthClient` is responsible for coordinating access and refresh tokens
 * against the iRacing authorization servers.
 *
 * TODO: Implement a token store mechanism so clients can store the tokens where they want
 * instead of handling responses directly.
 */
export class OAuthClient {
  private readonly clientMetadata: IRacingOAuthClientMetadata;
  private readonly stateStore: StateStore;
  private readonly sessionStore: SessionStore;
  private readonly createOAuthApi: OAuthApiClientFactory;
  private readonly sessionRefreshes = new Map<
    string,
    Promise<OAuthTokenResponse>
  >();

  protected authorizationServer: oauth.AuthorizationServer;
  protected authorizationClient: oauth.Client;
  protected clientAuthorization: oauth.ClientAuth;

  /**
   * Creates an OAuth client configured for the iRacing authorization servers.
   *
   * @param options - Client metadata, storage backends, and low-level API composition used by the client.
   * @throws {Error} If the client metadata does not match the expected schema.
   */
  constructor(options: OAuthClientOptions) {
    const { clientMetadata, stateStore, sessionStore } = options;

    this.clientMetadata =
      IRacingOAuthClientMetadataSchema.parse(clientMetadata);
    this.stateStore = stateStore;
    this.sessionStore = sessionStore;
    this.createOAuthApi =
      options.createOAuthApi ??
      ((apiOptions) => new OAuthApiClient(apiOptions));

    this.authorizationServer = {
      issuer: this.clientMetadata.issuer,
      authorization_endpoint: this.clientMetadata.authorizationUrl,
      token_endpoint: this.clientMetadata.tokenUrl,
      // userinfo_endpoint: this.clientMetadata.userInfoUrl,
    };

    this.authorizationClient = {
      client_id: this.clientMetadata.clientId,
    };

    this.clientAuthorization = this.clientMetadata.clientSecret
      ? oauth.ClientSecretPost(
          maskSecret(
            this.clientMetadata.clientSecret,
            this.clientMetadata.clientId,
          ),
        )
      : oauth.None();
  }

  /**
   * Generates an Authorization URL for kicking off the OAuth flow.
   * @returns The URL, verifier, and state parameter.
   *
   * @throws {Error} If the client is not configured with a redirect URI.
   */
  async authorize() {
    if (!this.clientMetadata.redirectUri) {
      throw ClientMetadataError.missingRedirectUri();
    }

    const verifier = oauth.generateRandomCodeVerifier();
    const challenge = await oauth.calculatePKCECodeChallenge(verifier);
    const state = oauth.generateRandomState();

    await this.stateStore.set(state, {
      verifier,
      iss: this.clientMetadata.issuer!,
      appState: state,
    });

    const authorizationUrl = new URL(this.clientMetadata.authorizationUrl);

    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set(
      "client_id",
      this.clientMetadata.clientId,
    );
    authorizationUrl.searchParams.set(
      "redirect_uri",
      this.clientMetadata.redirectUri,
    );

    if (this.clientMetadata.scopes) {
      authorizationUrl.searchParams.set(
        "scope",
        this.clientMetadata.scopes.join(" "),
      );
    }

    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    return { url: authorizationUrl, verifier, state };
  }

  /**
   * Authorizes the consumer with the password limited flow on iRacing auth servers.
   * @returns The session token from the OAuth API.
   *
   * @throws {Error} If username, password, or client secret are missing from the client configuration.
   * @throws {Error} If the grant request fails or the returned token payload cannot be parsed.
   */
  async passwordLimitedAuthorization() {
    const { username, password, clientId, clientSecret, scopes } =
      this.clientMetadata;

    if (!username) {
      throw ClientMetadataError.missingCredentials("username");
    }
    if (!password) {
      throw ClientMetadataError.missingCredentials("password");
    }

    if (!clientSecret) {
      throw ClientMetadataError.missingClientSecret();
    }

    const requestParameters =
      await OAuthPasswordLimitedGrantParametersSchema.parseAsync({
        grant_type: "password_limited",
        client_id: clientId,
        client_secret: maskSecret(clientSecret, clientId),
        username,
        password: maskSecret(password, username),
        scope: scopes.join(" "),
      });

    // The generated OAuth API client owns token-endpoint wire mechanics. The
    // protocol library still processes the response so OAuth response
    // semantics remain centralized in oauth4webapi.
    const response = await this.createOAuthApi({
      // Endpoint overrides are routing policy; the generated operation still
      // owns headers, form serialization, and request construction.
      fetchApi: (_input, init) => fetch(this.clientMetadata.tokenUrl, init),
    }).exchangeTokenRaw(requestParameters);

    const result = await oauth.processAuthorizationCodeResponse(
      this.authorizationServer,
      this.authorizationClient,
      response,
    );

    const token = await parseProcessedTokenResponse(result);

    // !!!: Store the password limited session by username.
    // !!!: Sessions are typically stored by the iRacing customer ID.
    await this.storeSession(username, token);

    return token;
  }

  /**
   * Given the parameters from the authorization server,
   * fetches the token.
   * @param params The query parameters from the authorization server.
   * @param sessionId Optional explicit storage key. When provided, no profile lookup is required.
   * @returns The auth token.
   *
   * @throws {Error} If the client is not configured with a redirect URI.
   * @throws {OAuthCallbackError} If the callback is missing the `state` or `code` parameter,
   *   or if the authorization session cannot be found.
   * @throws {OAuthCallbackError} If the authorization server returns an OAuth error response.
   * @throws {Error} If token exchange or token parsing fails, or if profile lookup fails when no explicit session ID is supplied.
   */
  async callback(params: URLSearchParams, sessionId?: string) {
    if (!this.clientMetadata.redirectUri) {
      throw ClientMetadataError.missingRedirectUri();
    }

    const stateParam = params.get("state");
    const codeParam = params.get("code");

    if (!stateParam) {
      throw OAuthCallbackError.stateMissing(params);
    }

    const stateData = await this.stateStore.get(stateParam);
    if (stateData) {
      // Prevent replay
      await this.stateStore.del(stateParam);
    } else {
      throw OAuthCallbackError.unknownAuthorizationState(stateParam, params);
    }

    let codeGrantParams: URLSearchParams;
    try {
      codeGrantParams = oauth.validateAuthResponse(
        this.authorizationServer,
        this.authorizationClient,
        params,
        stateParam,
      );
    } catch (error) {
      if (error instanceof oauth.AuthorizationResponseError) {
        throw OAuthCallbackError.authorizationError(error, params, stateParam);
      }

      throw error;
    }

    if (!codeParam) {
      throw OAuthCallbackError.codeMissing(params, stateData.appState);
    }

    const response = await oauth.authorizationCodeGrantRequest(
      this.authorizationServer,
      this.authorizationClient,
      this.clientAuthorization,
      codeGrantParams,
      this.clientMetadata.redirectUri,
      stateData.verifier!,
    );

    const result = await oauth.processAuthorizationCodeResponse(
      this.authorizationServer,
      this.authorizationClient,
      response,
    );

    const token = await parseProcessedTokenResponse(result);

    if (sessionId) {
      await this.storeSession(sessionId, token);
      return token;
    }

    /**
     * Without an application-owned session key, use the maintained OAuth API
     * client to fetch the user profile and cache by iRacing customer ID.
     */
    const profile = await this.createOAuthApi({
      accessToken: token.access_token,
      fetchApi: (_input, init) => fetch(this.clientMetadata.userInfoUrl, init),
    }).getProfile();

    await this.storeSession(profile.iracing_cust_id.toString(), token);

    return token;
  }

  /**
   * Refreshes a token for the given refresh token.
   * @param token The refresh token
   * @returns a new access token.
   *
   * @throws {OAuthRefreshError} If the OAuth server returns a structured refresh error body.
   * @throws {Error} If the refresh token request fails or the response body cannot be processed.
   */
  async refresh(token: string) {
    const response = await oauth.refreshTokenGrantRequest(
      this.authorizationServer,
      this.authorizationClient,
      this.clientAuthorization,
      token,
    );

    try {
      const result = await oauth.processRefreshTokenResponse(
        this.authorizationServer,
        this.authorizationClient,
        response,
      );

      return await parseProcessedTokenResponse(result);
    } catch (error) {
      if (error instanceof oauth.ResponseBodyError) {
        throw OAuthRefreshError.from(error);
      }

      throw error;
    }
  }

  /**
   * Makes a protected request on behalf of the provided `sessionId` against the iRacing API
   * as specified by `path`.
   *
   * This looks up a session for the given session ID, and forwards the access token to `oauth4webapi.protectedResourceRequest`.
   *
   * @param sessionId — The id of the session to use for the request.
   * @param method — The HTTP method for the request.
   * @param url — The path for the request, relative to the iRacing API URL.
   * @param headers — Headers for the request.
   * @param body — Request body compatible with the Fetch API and the request's method.
   * @returns Resolves with a {@link !Response} instance. WWW-Authenticate HTTP Header challenges are
   *   rejected with {@link WWWAuthenticateChallengeError}.
   *
   * @throws {OAuthRefreshError} If the stored session must be refreshed and the refresh fails.
   * @throws {Error} If no session can be restored for the provided session ID.
   * @throws {Error} If the downstream protected request fails.
   */
  async makeProtectedRequest(
    sessionId: string,
    method: string,
    path: string,
    headers?: Headers,
    body?: oauth.ProtectedResourceRequestBody,
    options?: oauth.ProtectedResourceRequestOptions,
  ) {
    const session = await this.restoreSessionForId(sessionId);
    if (session) {
      return this._makeProtectedRequest(
        session,
        method,
        path,
        headers,
        body,
        options,
      );
    } else {
      throw new SessionNotFoundError(sessionId);
    }
  }

  /**
   * Makes a protected request on behalf of the provided session.
   *
   * This forwards the stored access token to `oauth4webapi.protectedResourceRequest`.
   *
   * @param session - The session to use for the request.
   * @param method - The HTTP method for the request.
   * @param path - The path for the request, relative to the iRacing API URL.
   * @param headers - Headers for the request.
   * @param body - Request body compatible with the Fetch API and the request's method.
   * @param options - Additional request options passed through to the OAuth helper.
   * @returns Resolves with a {@link !Response} instance.
   * @throws {Error} If the protected resource request fails.
   */
  private async _makeProtectedRequest(
    session: OAuthTokenResponse,
    method: string,
    path: string,
    headers?: Headers,
    body?: oauth.ProtectedResourceRequestBody,
    options?: oauth.ProtectedResourceRequestOptions,
  ) {
    return await oauth.protectedResourceRequest(
      session.access_token,
      method,
      new URL(path, "https://members-ng.iracing.com"),
      headers,
      body,
      options,
    );
  }

  /**
   * Reads a session from the configured session store.
   *
   * @param sessionId - The session identifier to load.
   * @returns The stored session, or `undefined` when no session exists.
   */
  private async getSession(sessionId: string) {
    return await this.sessionStore.get(sessionId);
  }

  /**
   * Writes a session to the configured session store.
   *
   * @param sessionId - The session identifier to persist.
   * @param session - The session payload to store.
   */
  private async storeSession(sessionId: string, session: OAuthTokenResponse) {
    await this.sessionStore.set(sessionId, session);
  }

  /**
   * Refreshes a stored session using its refresh token and persists the updated result.
   *
   * @param sessionId - The session identifier to refresh.
   * @returns The complete persisted session.
   * @throws {OAuthRefreshError} If the session does not exist, is missing a refresh token,
   *   or the authorization server rejects the refresh grant.
   */
  private async refreshSessionForSessionId(sessionId: string) {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw OAuthRefreshError.sessionNotFound(sessionId);
    }

    // A delayed restoration may have read the old session before another
    // refresh finished. Recheck storage before using a single-use token.
    if (!isAccessTokenExpired(session.access_token)) {
      return session;
    }

    if (!session.refresh_token) {
      throw OAuthRefreshError.missingRefreshToken(sessionId);
    }

    const refreshed = await this.refresh(session.refresh_token);

    const updatedSession = {
      ...session,
      ...refreshed,
    };
    await this.storeSession(sessionId, updatedSession);

    return updatedSession;
  }

  /**
   * Decodes an access token into its header and payload structure.
   *
   * This validates the token shape, but does not verify the token signature.
   *
   * @throws {Error} If the token is not a valid JWT or does not match the expected access-token schema.
   */
  parseAccessToken(accessToken: string) {
    return decodeAccessToken(accessToken);
  }

  /**
   * Restores a session from storage, refreshing it if the access token has expired.
   *
   * @param sessionId - The session identifier to load.
   * @returns The stored session, or `undefined` when no session exists.
   * @throws {OAuthRefreshError} If a stored session must be refreshed and the refresh fails.
   * @throws {Error} If the stored access token is malformed.
   */
  async restoreSessionForId(
    sessionId: string,
  ): Promise<OAuthTokenResponse | undefined> {
    // Get the session
    const session = await this.getSession(sessionId);
    if (session) {
      // Check if the session is expired
      const isExpired = isAccessTokenExpired(session.access_token);
      if (isExpired) {
        let refresh = this.sessionRefreshes.get(sessionId);
        if (!refresh) {
          refresh = this.refreshSessionForSessionId(sessionId).finally(() => {
            // Keep coordination through persistence, and clear failures so a
            // subsequent restoration can retry without a cached rejection.
            if (this.sessionRefreshes.get(sessionId) === refresh) {
              this.sessionRefreshes.delete(sessionId);
            }
          });
          this.sessionRefreshes.set(sessionId, refresh);
        }
        return await refresh;
      }

      return session;
    }

    return undefined;
  }

  /**
   * Verifies an access token signature and then performs structural and claims validation.
   *
   * This checks signature validity, expiration, issuer, audience, scope, and claim consistency.
   *
   * @throws {Error} If the token cannot be verified before validation.
   * @throws {Error} If the token is expired or its time-based claims are inconsistent.
   * @throws {Error} If the issuer, client id, audience, environment, or required scopes do not match.
   */
  async validateAccessToken(
    accessToken: string,
    options: Omit<
      AccessTokenValidationOptions,
      "issuer" | "clientId" | "requiredScopes"
    > = {},
  ) {
    return await validateDecodedAccessToken(accessToken, {
      ...options,
      issuer: this.clientMetadata.issuer,
      clientId: this.clientMetadata.clientId,
      requiredScopes: this.clientMetadata.scopes,
    });
  }
}

export type { OAuthTokenResponse };

/** @deprecated Use OAuthTokenResponse instead. */
export type { IRacingOAuthTokenResponse } from "@iracing-data/oauth-schema";
