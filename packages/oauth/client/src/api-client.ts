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
import {
  Configuration,
  DefaultApi,
  type ExchangeTokenRequest as GeneratedExchangeTokenRequest,
} from "@iracing-data/oauth-client-fetch";

/**
 * Lazy or eager bearer-token provider accepted by the authored OAuth API facade and generated
 * client configuration.
 */
export type OAuthAccessTokenProvider =
  string | Promise<string> | (() => string | Promise<string>);

/**
 * Transport and endpoint policy used to construct the authored OAuth API facade without
 * coupling callers to the generated client.
 */
export interface OAuthApiClientOptions {
  /** Bearer credential or provider used to authorize API calls. */
  accessToken?: OAuthAccessTokenProvider;

  /** Optional override for the generated OAuth service base URL. */
  basePath?: string;

  /** Injected Fetch implementation used for outbound HTTP requests. */
  fetchApi?: typeof fetch;

  /** Default timeout for outbound requests in milliseconds. */
  requestTimeoutMs?: number;
}

/**
 * HTTP failure that retains the upstream response for protocol handling while exposing a
 * stable status-based error classification.
 */
export class OAuthApiHttpError extends Error {
  /** Upstream correlation header retained when present. */
  readonly requestId?: string;

  /**
   * Creates the classified OAuth failure with its operation context.
   * @param {Response} response - Upstream HTTP response retained for protocol handling.
   */
  constructor(readonly response: Response) {
    super(`OAuth API request failed with HTTP ${String(response.status)}.`);
    this.name = "OAuthApiHttpError";
    this.requestId = response.headers.get("x-request-id") ?? undefined;
  }
}

/**
 * OAuth API decoding failure that distinguishes transport, non-JSON, malformed JSON, and
 * schema-contract violations.
 */
export class OAuthApiContractError extends Error {
  /**
   * Creates the classified OAuth failure with its operation context.
   * @param {string} message - Human-readable explanation retained on the failure.
   * @param {"transport" | "not_json" | "invalid_json" | "contract"} kind - Safe classification distinguishing transport and decoding failures.
   */
  constructor(
    message: string,
    readonly kind:
      "transport" | "not_json" | "invalid_json" | "contract" = "contract",
  ) {
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

  /**
   * Configures the generated OAuth transport, request timeouts, and response validation.
   * @param {OAuthApiClientOptions} options - Bearer provider, service base URL, Fetch implementation, and request timeout.
   */
  constructor(options: OAuthApiClientOptions = {}) {
    const fetchApi = options.fetchApi ?? fetch;

    const requestTimeoutMs = options.requestTimeoutMs ?? 30_000;

    this.api = new DefaultApi(
      new Configuration({
        accessToken: options.accessToken,
        basePath: options.basePath,
        headers: { Accept: "application/json" },
        fetchApi: async (
          input: string | URL | Request,
          init: RequestInit = {},
        ) => {
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

  /**
   * Exchanges a supported grant and retains the raw response for OAuth protocol handling.
   * @param {OAuthTokenParameters} parameters - Typed parameters forwarded to the generated OAuth endpoint.
   * @returns {Promise<Response>} Raw token endpoint response, including OAuth error responses.
   */
  async exchangeTokenRaw(parameters: OAuthTokenParameters) {
    try {
      const response = await this.api.exchangeTokenRaw(
        parameters as unknown as GeneratedExchangeTokenRequest,
      );

      return response.raw;
    } catch (error) {
      const response = this.errorResponse(error);

      if (response) {
        return response;
      }

      throw this.contractError(error);
    }
  }

  /**
   * Exchanges a supported grant and validates the successful token response.
   * @param {OAuthTokenParameters} parameters - Typed parameters forwarded to the generated OAuth endpoint.
   * @returns {Promise<OAuthTokenResponse>} Validated successful token response.
   */
  async exchangeToken(
    parameters: OAuthTokenParameters,
  ): Promise<OAuthTokenResponse> {
    const response = await this.exchangeTokenRaw(parameters);

    if (!response.ok) {
      throw new OAuthApiHttpError(response);
    }

    return await this.parseJson(response, (value) =>
      OAuthTokenResponseSchema.parse(value),
    );
  }

  /**
   * Fetches and validates the authenticated member profile.
   * @returns {Promise<OAuthProfileResponse>} Validated authenticated member profile.
   */
  async getProfile(): Promise<OAuthProfileResponse> {
    try {
      const response = await this.api.getProfileRaw();

      return await this.parseJson(response.raw, (value) =>
        OAuthProfileResponseSchema.parse(value),
      );
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Fetches and validates the OAuth session list.
   * @returns {Promise<OAuthSessions>} Validated list of OAuth sessions.
   */
  async getSessions(): Promise<OAuthSessions> {
    try {
      const response = await this.api.getSessionsRaw();

      return await this.parseJson(response.raw, (value) =>
        OAuthSessionsSchema.parse(value),
      );
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Revokes the current OAuth session with optional browser forgetting.
   * @param {OAuthRevokeCurrentSessionParameters} parameters - Typed parameters forwarded to the generated OAuth endpoint.
   * @returns {Promise<void>} Completion of current-session revocation.
   */
  async revokeCurrent(parameters: OAuthRevokeCurrentSessionParameters = {}) {
    try {
      await this.api.revokeCurrent(parameters);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Revokes the selected opaque OAuth session identifiers.
   * @param {OAuthRevokeSessionsParameters} parameters - Typed parameters forwarded to the generated OAuth endpoint.
   * @returns {Promise<void>} Completion of selected-session revocation.
   */
  async revokeSessions(parameters: OAuthRevokeSessionsParameters) {
    try {
      await this.api.revokeSessions({
        session_ids: parameters.session_ids.join(","),
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Revokes all sessions associated with the current OAuth client.
   * @returns {Promise<void>} Completion of client-wide revocation.
   */
  async revokeClient() {
    try {
      await this.api.revokeClient();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof OAuthApiHttpError) {
      return error;
    }

    const response = this.errorResponse(error);

    if (response) {
      return new OAuthApiHttpError(response);
    }

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
    if (error instanceof OAuthApiContractError) {
      return error;
    }

    if (error instanceof Error && error.name === "FetchError") {
      return new OAuthApiContractError(
        "OAuth API request failed before a response was received.",
        "transport",
      );
    }

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
      throw new OAuthApiContractError(
        "OAuth API response was not JSON.",
        "not_json",
      );
    }

    let value: unknown;

    try {
      value = await response.json();
    } catch {
      throw new OAuthApiContractError(
        "OAuth API response contained invalid JSON.",
        "invalid_json",
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

/**
 * Minimal profile capability exposed to consumers that only need authenticated identity
 * lookup.
 */
export type OAuthProfileApi = Pick<OAuthApiClient, "getProfile">;

/**
 * Protocol-facing OAuth capabilities consumed by the higher-level lifecycle client for token
 * exchange and profile validation.
 */
export type OAuthProtocolApi = Pick<
  OAuthApiClient,
  "exchangeTokenRaw" | "getProfile"
>;

/**
 * Factory seam for constructing the protocol facade from endpoint, transport, and access-token
 * policy.
 * @param {OAuthApiClientOptions} options - Bearer provider, service base URL, Fetch implementation, and request timeout.
 * @returns {OAuthProtocolApi} Endpoint facade used by the authored OAuth lifecycle.
 */
export type OAuthApiClientFactory = (
  options: OAuthApiClientOptions,
) => OAuthProtocolApi;
