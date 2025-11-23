import {
  IRacingOAuthTokenResponseSchema,
  IRacingOAuthTokenResponse,
  IRacingOAuthPasswordLimitedGrantParametersSchema,
} from "@iracing-data/oauth-schema";
import * as oauth from "oauth4webapi";
import { OAuthCallbackError } from "./oauth-callback-error";
import {
  IRacingOAuthClientMetadata,
  IRacingOAuthClientMetadataInput,
  IRacingOAuthClientMetadataSchema,
  StateStore,
} from "./schema";
import { sanitizeTokenResponse, maskSecret } from "./utils";

export type OAuthClientOptions = {
  // Config
  clientMetadata: Readonly<IRacingOAuthClientMetadataInput>;

  // Stores
  stateStore: StateStore;
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

  protected authorizationServer: oauth.AuthorizationServer;
  protected authorizationClient: oauth.Client;
  protected clientAuthorization: oauth.ClientAuth;

  constructor(options: OAuthClientOptions) {
    const { clientMetadata, stateStore } = options;

    this.clientMetadata =
      IRacingOAuthClientMetadataSchema.parse(clientMetadata);
    this.stateStore = stateStore;

    this.authorizationServer = {
      issuer: this.clientMetadata.issuer,
      token_endpoint: this.clientMetadata.tokenUrl,
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
    // TODO: Throw an error if the client is configured incorrectly.

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
   *
   * TODO: Implement a token store mechanism so clients can store the tokens where they want
   * instead of handling responses directly.
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

    const response = await fetch("https://oauth.iracing.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(requestParameters),
    });

    // TODO: Check headers? Return rate-limit status?

    // !!!: Likely can remove...
    const normalizedResponse = await sanitizeTokenResponse(response);

    // Check the response as if it were any other oauth4webapi request for sanity.
    const result = await oauth.processAuthorizationCodeResponse(
      this.authorizationServer,
      this.authorizationClient,
      normalizedResponse
    );

    return await IRacingOAuthTokenResponseSchema.parseAsync(result);
  }

  /**
   * Given the parameters from the authorization server,
   * fetches the token.
   * @param params The query parameters from the authorization server.
   * @returns The auth token.
   */
  async callback(params: URLSearchParams) {
    const stateParam = params.get("state");
    const codeParam = params.get("code");
    // const errorParam = params.get("error");
    // const errorDescriptionParam = params.get("error_description");
    // const errorUriParam = params.get("error_uri");

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

    // !!!: We likely can remove this, given the new iRacing typings, but I need to verify.
    const normalizedResponse = await sanitizeTokenResponse(response);

    const result = await oauth.processAuthorizationCodeResponse(
      this.authorizationServer,
      this.authorizationClient,
      normalizedResponse
    );

    return await IRacingOAuthTokenResponseSchema.parseAsync(result);
  }

  async refresh(token: string) {
    const response = await oauth.refreshTokenGrantRequest(
      this.authorizationServer,
      this.authorizationClient,
      this.clientAuthorization,
      token
    );

    // !!!: We probably don't need this anymore, but adding for safety before I can test and publish...
    const normalizedResponse = await sanitizeTokenResponse(response);

    const result = await oauth.processRefreshTokenResponse(
      this.authorizationServer,
      this.authorizationClient,
      normalizedResponse
    );

    return await IRacingOAuthTokenResponseSchema.parseAsync(result);
  }
}

export type { IRacingOAuthTokenResponse };
