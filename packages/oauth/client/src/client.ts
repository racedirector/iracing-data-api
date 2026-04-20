import {
  IRacingOAuthTokenResponseSchema,
  IRacingOAuthTokenResponse,
  IRacingOAuthPasswordLimitedGrantParametersSchema,
  IRacingOAuthProfileResponse,
} from "@iracing-data/oauth-schema";
import * as oauth from "oauth4webapi";
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
  isRefreshTokenExpired,
  maskSecret,
  validateAccessToken as validateDecodedAccessToken,
} from "./utils";
import { ClientMetadataError, SessionNotFoundError } from "./errors";

export type OAuthClientOptions = {
  // Config
  clientMetadata: Readonly<IRacingOAuthClientMetadataInput>;

  // Stores
  stateStore: StateStore;
  sessionStore: SessionStore;
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

  protected authorizationServer: oauth.AuthorizationServer;
  protected authorizationClient: oauth.Client;
  protected clientAuthorization: oauth.ClientAuth;

  /**
   * Creates an OAuth client configured for the iRacing authorization servers.
   *
   * @param options - Client metadata and storage backends used by the client.
   * @throws {Error} If the client metadata does not match the expected schema.
   */
  constructor(options: OAuthClientOptions) {
    const { clientMetadata, stateStore, sessionStore } = options;

    this.clientMetadata =
      IRacingOAuthClientMetadataSchema.parse(clientMetadata);
    this.stateStore = stateStore;
    this.sessionStore = sessionStore;

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
      await IRacingOAuthPasswordLimitedGrantParametersSchema.parseAsync({
        grant_type: "password_limited",
        client_id: clientId,
        client_secret: maskSecret(clientSecret, clientId),
        username,
        password: maskSecret(password, username),
        scope: scopes.join(" "),
      });

    const requestParams = new URLSearchParams(requestParameters);

    /**
     * !!!: Manually send the request to the token endpoint because `oauth4webapi` doesn't expose
     * a public token request endpoint function.
     */
    const response = await fetch(this.clientMetadata.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestParams,
    });

    // Check the response as if it were any other oauth4webapi request for sanity.
    const result = await oauth.processAuthorizationCodeResponse(
      this.authorizationServer,
      this.authorizationClient,
      response,
    );

    const token = await IRacingOAuthTokenResponseSchema.parseAsync(result);

    // !!!: Store the password limited session by username.
    // !!!: Sessions are typically stored by the iRacing customer ID.
    await this.storeSession(username, token);

    return token;
  }

  /**
   * Given the parameters from the authorization server,
   * fetches the token.
   * @param params The query parameters from the authorization server.
   * @returns The auth token.
   *
   * @throws {Error} If the client is not configured with a redirect URI.
   * @throws {OAuthCallbackError} If the callback is missing the `state` or `code` parameter,
   *   or if the authorization session cannot be found.
   * @throws {OAuthCallbackError} If the authorization server returns an OAuth error response.
   * @throws {Error} If token exchange, token parsing, or profile lookup fails.
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

    if (!codeParam) {
      throw OAuthCallbackError.codeMissing(params, stateData.appState);
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

    const token = await IRacingOAuthTokenResponseSchema.parseAsync(result);

    /**
     * Using the returned token, make a request to the configured user info endpoint
     * to fetch the user's profile for session caching.
     */
    const profileResponse = await oauth.protectedResourceRequest(
      token.access_token,
      "GET",
      new URL(this.clientMetadata.userInfoUrl),
    );

    const profileData =
      (await profileResponse.json()) as IRacingOAuthProfileResponse;

    // Store the session by the provided session ID when available, otherwise fall back to the iRacing customer id.
    await this.storeSession(
      sessionId ?? profileData.iracing_cust_id.toString(),
      token,
    );

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

      return await IRacingOAuthTokenResponseSchema.parseAsync(result);
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
    session: IRacingOAuthTokenResponse,
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
  private async storeSession(
    sessionId: string,
    session: IRacingOAuthTokenResponse,
  ) {
    await this.sessionStore.set(sessionId, session);
  }

  /**
   * Refreshes a stored session using its refresh token and persists the updated result.
   *
   * @param sessionId - The session identifier to refresh.
   * @returns The refreshed token response.
   * @throws {OAuthRefreshError} If the session does not exist, is missing a refresh token,
   *   or the refresh token is expired.
   */
  private async refreshSessionForSessionId(sessionId: string) {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw OAuthRefreshError.sessionNotFound(sessionId);
    }

    if (!session.refresh_token) {
      throw OAuthRefreshError.missingRefreshToken(sessionId);
    }

    if (isRefreshTokenExpired(session.refresh_token)) {
      throw OAuthRefreshError.tokenExpired(sessionId);
    }

    const refreshed = await this.refresh(session.refresh_token);

    await this.storeSession(sessionId, {
      ...session,
      ...refreshed,
    });

    return refreshed;
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
  ): Promise<IRacingOAuthTokenResponse | undefined> {
    // Get the session
    const session = await this.getSession(sessionId);
    if (session) {
      // Check if the session is expired
      const isExpired = isAccessTokenExpired(session.access_token);
      if (isExpired) {
        // Refresh the session
        return await this.refreshSessionForSessionId(sessionId);
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

export type { IRacingOAuthTokenResponse };
