import {
  IRacingOAuthTokenResponseSchema,
  IRacingOAuthTokenResponse,
} from "@iracing-data/oauth-schema";
import * as oauth from "oauth4webapi";
import { OAuthCallbackError } from "./oauth-callback-error";
import {
  IRacingOAuthClientMetadata,
  IRacingOAuthClientMetadataInput,
  IRacingOAuthClientMetadataSchema,
  StateStore,
} from "./schema";
import { sanitizeTokenResponse } from "./utils";

export type OAuthClientOptions = {
  // Config
  clientMetadata: Readonly<IRacingOAuthClientMetadataInput>;

  // Stores
  stateStore: StateStore;
};

export class OAuthClient {
  private readonly clientMetadata: IRacingOAuthClientMetadata;
  private readonly stateStore: StateStore;

  constructor(options: OAuthClientOptions) {
    const { clientMetadata, stateStore } = options;

    this.clientMetadata =
      IRacingOAuthClientMetadataSchema.parse(clientMetadata);
    this.stateStore = stateStore;
  }

  /**
   * Generates an Authorization URL for kicking off the OAuth flow.
   * @returns The URL, verifier, and state parameter.
   */
  async authorize() {
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
   * Given the parameters from the authorization server,
   * fetches the token.
   * @param params The query parameters from the authorization server.
   * @returns The auth token.
   */
  async callback(params: URLSearchParams) {
    const stateParam = params.get("state");
    const codeParam = params.get("code");
    const errorParam = params.get("error");
    const errorDescriptionParam = params.get("error_description");
    const errorUriParam = params.get("error_uri");

    if (!stateParam) {
      throw new OAuthCallbackError(params, 'Missing "state" parameter.');
    }

    const authorizationServer: oauth.AuthorizationServer = {
      issuer: this.clientMetadata.issuer,
      token_endpoint: this.clientMetadata.tokenUrl,
    };

    const client: oauth.Client = {
      client_id: this.clientMetadata.clientId,
    };

    const clientAuth = oauth.None();

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
        authorizationServer,
        client,
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
      authorizationServer,
      client,
      clientAuth,
      codeGrantParams,
      this.clientMetadata.redirectUri,
      stateData.verifier!
    );

    const normalizedResponse = await sanitizeTokenResponse(response);

    const result = await oauth.processAuthorizationCodeResponse(
      authorizationServer,
      client,
      normalizedResponse
    );

    return await IRacingOAuthTokenResponseSchema.parseAsync(result);
  }

  async refresh(token: string) {
    const authorizationServer: oauth.AuthorizationServer = {
      issuer: this.clientMetadata.issuer,
      token_endpoint: this.clientMetadata.tokenUrl,
    };

    const client: oauth.Client = {
      client_id: this.clientMetadata.clientId,
    };

    const response = await oauth.refreshTokenGrantRequest(
      authorizationServer,
      client,
      oauth.None(),
      token
    );

    const result = await oauth.processRefreshTokenResponse(
      authorizationServer,
      client,
      response
    );

    return await IRacingOAuthTokenResponseSchema.parseAsync(result);
  }
}

export type { IRacingOAuthTokenResponse };
