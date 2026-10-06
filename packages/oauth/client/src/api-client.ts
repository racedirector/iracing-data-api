import {
  Configuration,
  DefaultApi,
  type ExchangeTokenRequest as GeneratedExchangeTokenRequest,
} from "@iracing-data/oauth-client-fetch";
import {
  OAuthProfileResponseSchema,
  OAuthSessionsSchema,
  OAuthTokenResponseSchema,
  type OAuthProfileResponse,
  type OAuthRevokeCurrentSessionParameters,
  type OAuthRevokeSessionsParameters,
  type OAuthSessions,
  type OAuthTokenParameters,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-schema";

export type OAuthAccessTokenProvider =
  string | Promise<string> | (() => string | Promise<string>);

export interface OAuthApiClientOptions {
  accessToken?: OAuthAccessTokenProvider;
  basePath?: string;
  fetchApi?: typeof fetch;
  requestTimeoutMs?: number;
}

export class OAuthApiHttpError extends Error {
  readonly requestId?: string;

  constructor(readonly response: Response) {
    super(`OAuth API request failed with HTTP ${response.status}.`);
    this.name = "OAuthApiHttpError";
    this.requestId = response.headers.get("x-request-id") ?? undefined;
  }
}

export class OAuthApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OAuthApiContractError";
  }
}

/**
 * Stable low-level boundary over the generated iRacing OAuth Fetch client.
 *
 * The generated workspace owns endpoint paths, bearer authentication, request
 * serialization, and response model conversion. This authored facade keeps
 * package-level policy such as request timeouts, safe error normalization, and
 * runtime contract validation.
 */
export class OAuthApiClient {
  private readonly api: DefaultApi;

  constructor(options: OAuthApiClientOptions = {}) {
    const fetchApi = options.fetchApi ?? fetch;
    const requestTimeoutMs = options.requestTimeoutMs ?? 30_000;

    this.api = new DefaultApi(
      new Configuration({
        accessToken: options.accessToken,
        basePath: options.basePath,
        headers: { Accept: "application/json" },
        fetchApi: async (input, init: RequestInit = {}) => {
          const headers = new Headers(init.headers);
          if (
            init.body instanceof URLSearchParams &&
            !headers.has("content-type")
          ) {
            headers.set("content-type", "application/x-www-form-urlencoded");
          }
          return await fetchApi(input, {
            ...init,
            headers,
            redirect: init.redirect ?? "error",
            signal: init.signal ?? AbortSignal.timeout(requestTimeoutMs),
          });
        },
      }),
    );
  }

  async exchangeTokenRaw(parameters: OAuthTokenParameters) {
    try {
      const response = await this.api.exchangeTokenRaw(
        parameters as unknown as GeneratedExchangeTokenRequest,
      );
      return response.raw;
    } catch (error) {
      const response = this.errorResponse(error);
      if (response) return response;
      throw this.contractError(error);
    }
  }

  async exchangeToken(
    parameters: OAuthTokenParameters,
  ): Promise<OAuthTokenResponse> {
    const response = await this.exchangeTokenRaw(parameters);
    if (!response.ok) throw new OAuthApiHttpError(response);
    return await this.parseJson(response, OAuthTokenResponseSchema.parse);
  }

  async getProfile(): Promise<OAuthProfileResponse> {
    try {
      return OAuthProfileResponseSchema.parse(await this.api.getProfile());
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getSessions(): Promise<OAuthSessions> {
    try {
      return OAuthSessionsSchema.parse(await this.api.getSessions());
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeCurrent(parameters: OAuthRevokeCurrentSessionParameters = {}) {
    try {
      await this.api.revokeCurrent(parameters);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeSessions(parameters: OAuthRevokeSessionsParameters) {
    try {
      await this.api.revokeSessions({
        session_ids: parameters.session_ids.join(","),
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeClient() {
    try {
      await this.api.revokeClient();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof OAuthApiHttpError) return error;
    const response = this.errorResponse(error);
    if (response) return new OAuthApiHttpError(response);
    return this.contractError(error);
  }

  private errorResponse(error: unknown): Response | undefined {
    if (
      error instanceof Error &&
      error.name === "ResponseError" &&
      "response" in error &&
      error.response instanceof Response
    ) {
      return error.response;
    }
    return undefined;
  }

  private contractError(error: unknown) {
    if (error instanceof OAuthApiContractError) return error;
    const reason = error instanceof Error ? error.name : "unknown error";
    return new OAuthApiContractError(
      `OAuth API request or response did not match the maintained contract: ${reason}.`,
    );
  }

  private async parseJson<T>(
    response: Response,
    parse: (value: unknown) => T,
  ): Promise<T> {
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new OAuthApiContractError("OAuth API response was not JSON.");
    }

    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new OAuthApiContractError(
        "OAuth API response contained invalid JSON.",
      );
    }

    try {
      return parse(value);
    } catch {
      throw new OAuthApiContractError(
        "OAuth API response did not match the maintained contract.",
      );
    }
  }
}

export type OAuthProfileApi = Pick<OAuthApiClient, "getProfile">;
export type OAuthProtocolApi = Pick<
  OAuthApiClient,
  "exchangeTokenRaw" | "getProfile"
>;
export type OAuthApiClientFactory = (
  options: OAuthApiClientOptions,
) => OAuthProtocolApi;
