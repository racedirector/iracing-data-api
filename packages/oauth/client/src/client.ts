import * as oauth from "oauth4webapi";
import { discover } from "./discovery";
import { OAuthCallbackError } from "./oauth-callback-error";
import { IRacingOAuthEndpoints } from "./schema/iracing-oauth-endpoints-schema";
import {
  OAuthClientMetadata,
  OAuthClientMetadataInput,
  OAuthClientMetadataSchema,
} from "./schema/oauth-client-metadata-schema";
import { StateStore } from "./schema/state-store";

async function extractEndpointsOrDiscover(
  metadata: Pick<
    OAuthClientMetadata,
    "authorizationUrl" | "tokenUrl" | "issuer"
  >
): Promise<IRacingOAuthEndpoints> {
  if (metadata.authorizationUrl && metadata.tokenUrl) {
    return {
      authorization: metadata.authorizationUrl,
      token: metadata.tokenUrl,
    };
  }

  // The zod `.parse` call ensures that this is set if authorizationUrl and tokenUrl are not.
  const as = await discover(metadata.issuer!);

  // `discover` will throw if either of these endpoints are missing.
  return {
    authorization: as.authorization_endpoint!,
    token: as.token_endpoint!,
  };
}

type OAuthClientOptions = {
  // Config
  clientMetadata: Readonly<OAuthClientMetadataInput>;

  // Stores
  stateStore: StateStore;

  // Services
  fetch?: typeof globalThis.fetch;
};

export class OAuthClient {
  private clientMetadata!: OAuthClientMetadata;
  private stateStore!: StateStore;

  static async create(options: OAuthClientOptions) {
    const { clientMetadata, stateStore, fetch = globalThis.fetch } = options;

    const normalizedMetadata = OAuthClientMetadataSchema.parse(clientMetadata);
    const client = new OAuthClient();
    client.clientMetadata = normalizedMetadata;
    client.stateStore = stateStore;

    return client;
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

    const { authorization } = await extractEndpointsOrDiscover(
      this.clientMetadata
    );

    signal?.throwIfAborted();

    const authorizationUrl = new URL(authorization);
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

    const { token } = await extractEndpointsOrDiscover(this.clientMetadata);

    const tokenUrl = new URL(token);
    tokenUrl.searchParams.set("grant_type", "authorization_code");
    tokenUrl.searchParams.set("client_id", this.clientMetadata.clientId);
    tokenUrl.searchParams.set("code", codeParam);
    tokenUrl.searchParams.set("redirect_uri", this.clientMetadata.redirectUri);
    tokenUrl.searchParams.set("code_verifier", stateData.verifier!);
  }

  async _callback(params: URLSearchParams) {
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

    const codeGrantResponse = await oauth.authorizationCodeGrantRequest(
      authorizationServer,
      client,
      clientAuth,
      codeGrantParams,
      this.clientMetadata.redirectUri,
      stateData.verifier!
    );

    console.log("Got code grant response:", codeGrantResponse);
  }
}
