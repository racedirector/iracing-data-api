import * as oauth from "oauth4webapi";
import { discover } from "./discovery";
import { OAuthCallbackError } from "./oauth-callback-error";
import {
  OAuthClientMetadata,
  OAuthClientMetadataInput,
  OAuthClientMetadataSchema,
} from "./schema/oauth-client-metadata-schema";
import { StateStore } from "./schema/state-store";

type OAuthClientOptions = {
  // Config
  clientMetadata: Readonly<OAuthClientMetadataInput>;

  // Stores
  stateStore: StateStore;
};

export class OAuthClient {
  private readonly clientMetadata: OAuthClientMetadata;
  private readonly stateStore: StateStore;

  constructor(options: OAuthClientOptions) {
    const { clientMetadata, stateStore } = options;

    this.clientMetadata = OAuthClientMetadataSchema.parse(clientMetadata);
    this.stateStore = stateStore;
  }

  async authorize({ signal }: { signal: AbortSignal }) {
    const verifier = oauth.generateRandomCodeVerifier();
    const challenge = await oauth.calculatePKCECodeChallenge(verifier);

    signal?.throwIfAborted();

    const state = oauth.generateRandomState();

    await this.stateStore.set(state, {
      verifier,
      iss: this.clientMetadata.issuer!,
      appState: state,
    });

    signal?.throwIfAborted();

    /**
     * Get the authorization URL from client metadata or discovery.
     */
    let authorizationUrl: URL;
    if (!this.clientMetadata.authorizationUrl) {
      const as = await discover(this.clientMetadata.issuer);
      // Discover will throw if authorization_endpoint is null or undefined.
      authorizationUrl = new URL(as.authorization_endpoint!);
    } else {
      authorizationUrl = new URL(this.clientMetadata.authorizationUrl);
    }

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
      authorizationUrl.searchParams.set("scope", this.clientMetadata.scopes);
    }

    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    return { url: authorizationUrl, verifier, state };
  }

  async callback(params: URLSearchParams) {
    const stateParam = params.get("state");
    const codeParam = params.get("code");
    const errorParam = params.get("error");
    const errorDescriptionParam = params.get("error_description");
    const errorUriParam = params.get("error_uri");

    if (!stateParam) {
      throw new OAuthCallbackError(params, 'Missing "state" parameter.');
    }

    let authorizationServer: oauth.AuthorizationServer;
    if (!this.clientMetadata.tokenUrl) {
      // TODO: Make a discovery request
      authorizationServer = await discover(this.clientMetadata.issuer);
    } else {
      authorizationServer = {
        issuer: this.clientMetadata.issuer,
        token_endpoint: this.clientMetadata.tokenUrl,
      };
    }

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

    const result = await oauth.processAuthorizationCodeResponse(
      authorizationServer,
      client,
      response
    );

    return result;
  }
}
