import {
  IRacingOAuthTokenResponseSchema,
  IRacingOAuthTokenResponse,
  IRacingOAuthPasswordLimitedGrantParametersSchema,
  IRacingOAuthProfileResponse,
} from "@iracing-data/oauth-schema";
import * as oauth from "oauth4webapi";
import { OAuthCallbackError, OAuthRefreshError } from "./oauth-callback-error";
import {
  IRacingOAuthClientMetadata,
  IRacingOAuthClientMetadataInput,
  IRacingOAuthClientMetadataSchema,
  SessionStore,
  StateStore,
} from "./schema";
import { isAccessTokenExpired, maskSecret } from "./utils";

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
            this.clientMetadata.clientId
          )
        )
      : oauth.None();
  }

  /**
   * Generates an Authorization URL for kicking off the OAuth flow.
   * @returns The URL, verifier, and state parameter.
   */
  async authorize() {
    if (!this.clientMetadata.redirectUri) {
      throw new Error(
        "Client is not configured for the authorization code flow; missing `redirectUri`."
      );
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
      this.clientMetadata.clientId
    );
    authorizationUrl.searchParams.set(
      "redirect_uri",
      this.clientMetadata.redirectUri
    );

    if (this.clientMetadata.scopes) {
      authorizationUrl.searchParams.set(
        "scope",
        this.clientMetadata.scopes.join(" ")
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
   */
  async passwordLimitedAuthorization() {
    const { username, password, clientId, clientSecret, scopes } =
      this.clientMetadata;

    if (!username) {
      throw new Error(
        "No username provided for password limited authentication flow."
      );
    }

    if (!password) {
      throw new Error(
        "No password provided for password limited authentication flow."
      );
    }

    if (!clientSecret) {
      throw new Error(
        "Client secret not provided; password limited authorization is not allowed."
      );
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
    const response = await fetch("https://oauth.iracing.com/oauth2/token", {
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
      response
    );

    const token = await IRacingOAuthTokenResponseSchema.parseAsync(result);

    // !!!: Store the password limited session by username.
    // !!!: Sessions are typically stored by the iRacing customer ID.
    await this.sessionStore.set(username, token);

    return token;
  }

  /**
   * Given the parameters from the authorization server,
   * fetches the token.
   * @param params The query parameters from the authorization server.
   * @returns The auth token.
   */
  async callback(params: URLSearchParams, sessionId?: string) {
    if (!this.clientMetadata.redirectUri) {
      throw new Error(
        "Client is not configured for the authorization code flow; missing `redirectUri`."
      );
    }

    const stateParam = params.get("state");
    const codeParam = params.get("code");

    if (!stateParam) {
      throw new OAuthCallbackError(params, 'Missing "state" parameter.');
    }

    const stateData = await this.stateStore.get(stateParam);
    if (stateData) {
      // Prevent replay
      await this.stateStore.del(stateParam);
    } else {
      throw new OAuthCallbackError(
        params,
        `Unknown authorization session "${stateParam}"`
      );
    }

    if (!codeParam) {
      throw new OAuthCallbackError(
        params,
        'Missing "code" query parameter.',
        stateData.appState
      );
    }

    let codeGrantParams: URLSearchParams;
    try {
      codeGrantParams = oauth.validateAuthResponse(
        this.authorizationServer,
        this.authorizationClient,
        params,
        stateParam
      );
    } catch (error) {
      if (error instanceof oauth.AuthorizationResponseError) {
        throw new OAuthCallbackError(
          params,
          "OAuth Provider returned an error",
          stateParam,
          error.cause
        );
      }

      throw error;
    }

    const response = await oauth.authorizationCodeGrantRequest(
      this.authorizationServer,
      this.authorizationClient,
      this.clientAuthorization,
      codeGrantParams,
      this.clientMetadata.redirectUri,
      stateData.verifier!
    );

    const result = await oauth.processAuthorizationCodeResponse(
      this.authorizationServer,
      this.authorizationClient,
      response
    );

    const token = await IRacingOAuthTokenResponseSchema.parseAsync(result);

    /**
     * Using the returned token, make a request to `/iracing/profile` on the OAuth API
     * to fetch the user's profile for session caching.
     */
    const profileResponse = await oauth.protectedResourceRequest(
      token.access_token,
      "GET",
      new URL("/iracing/profile", this.clientMetadata.issuer)
    );

    const profileData =
      (await profileResponse.json()) as IRacingOAuthProfileResponse;

    // Store the session by the iracing customer id.
    await this.sessionStore.set(profileData.iracing_cust_id.toString(), token);

    return token;
  }

  /**
   * Refreshes a token for the given refresh token.
   * @param token The refresh token
   * @returns a new access token.
   */
  async refresh(token: string) {
    const response = await oauth.refreshTokenGrantRequest(
      this.authorizationServer,
      this.authorizationClient,
      this.clientAuthorization,
      token
    );

    try {
      const result = await oauth.processRefreshTokenResponse(
        this.authorizationServer,
        this.authorizationClient,
        response
      );

      return await IRacingOAuthTokenResponseSchema.parseAsync(result);
    } catch (error) {
      if (error instanceof oauth.ResponseBodyError) {
        throw OAuthRefreshError.from(error);
      }
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
   */
  async makeProtectedRequest(
    sessionId: string,
    method: string,
    path: string,
    headers?: Headers,
    body?: oauth.ProtectedResourceRequestBody,
    options?: oauth.ProtectedResourceRequestOptions
  ) {
    const session = await this.restoreSession(sessionId);
    if (session) {
      return this._makeProtectedRequest(
        session,
        method,
        path,
        headers,
        body,
        options
      );
    } else {
      throw new Error(
        `Could not find session matching ${sessionId}. Did you forget to authenticate?`
      );
    }
  }

  /**
   * Makes a protected request on behalf of the provided `session` against the iRacing API
   * as specified by `path`.
   *
   * This looks up a session for the given session ID, and forwards the access token to `oauth4webapi.protectedResourceRequest`.
   *
   * @param session — The session to use for the request.
   * @param method — The HTTP method for the request.
   * @param url — The path for the request, relative to the iRacing API URL.
   * @param headers — Headers for the request.
   * @param body — Request body compatible with the Fetch API and the request's method.
   * @returns Resolves with a {@link !Response} instance. WWW-Authenticate HTTP Header challenges are
   *   rejected with {@link WWWAuthenticateChallengeError}.
   */
  private async _makeProtectedRequest(
    session: IRacingOAuthTokenResponse,
    method: string,
    path: string,
    headers?: Headers,
    body?: oauth.ProtectedResourceRequestBody,
    options?: oauth.ProtectedResourceRequestOptions
  ) {
    return await oauth.protectedResourceRequest(
      session.access_token,
      method,
      new URL(path, "https://members-ng.iracing.com"),
      headers,
      body,
      options
    );
  }

  async restoreSession(id: string) {
    // Get the session
    const session = await this.getSession(id);
    if (session) {
      // Check if the session is expired
      const isExpired = isAccessTokenExpired(session.access_token);
      if (isExpired) {
        // Refresh the session
        return await this.refreshSession(id);
      }

      return session;
    }
  }

  private async getSession(sessionId: string) {
    return await this.sessionStore.get(sessionId);
  }

  private async storeSession(
    sessionId: string,
    session: IRacingOAuthTokenResponse
  ) {
    await this.sessionStore.set(sessionId, session);
  }

  private async refreshSession(sessionId: string) {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`No session found for key "${sessionId}"`);
    }

    if (!session.refresh_token) {
      throw new Error(
        `Session "${sessionId}" cannot be refreshed; missing refresh token.`
      );
    }

    const refreshed = await this.refresh(session.refresh_token);

    await this.storeSession(sessionId, {
      ...session,
      ...refreshed,
    });

    return refreshed;
  }
}

export type { IRacingOAuthTokenResponse };
