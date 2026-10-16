/**
 * Reusable OAuth error information, not an outward diagnostic envelope.
 *
 * Callback errors retain params/state and causes; refresh errors retain dependency
 * message, description, code and cause. The dependency library code is distinct
 * from the provider OAuth error identifier, which can remain in the structured cause.
 * Consumers must inspect explicit discriminators/evidence, not message substrings,
 * when deciding lifecycle recovery. Network/parser errors can propagate separately.
 * Do not log/serialize raw errors: parameters, provider text and causes can be
 * sensitive. CLI/MCP own safe projections and application retry/quarantine policy.
 */
import type {
  AuthorizationResponseError,
  ResponseBodyError,
} from "oauth4webapi";

/**
 * Authorization-callback failure that retains callback evidence for trusted callers while
 * preserving the original cause when available.
 */
export class OAuthCallbackError extends Error {
  /**
   * Normalizes the supplied failure into the authored error contract.
   * @param {unknown} err - Original OAuth failure to classify and preserve.
   * @param {URLSearchParams} params - Query parameters received on the authorization callback.
   * @param {string} state - Authorization state associated with the callback.
   * @returns {OAuthCallbackError} Classified OAuth failure retaining the relevant operation context.
   */
  static from(err: unknown, params: URLSearchParams, state?: string) {
    if (err instanceof OAuthCallbackError) {
      return err;
    }

    const message = err instanceof Error ? err.message : undefined;

    return new OAuthCallbackError(params, message, state, err);
  }

  /**
   * Preserves an authorization-server rejection and callback context.
   * @param {AuthorizationResponseError} error - Unknown failure to classify without exposing secrets.
   * @param {URLSearchParams} params - Query parameters received on the authorization callback.
   * @param {string} state - Authorization state associated with the callback.
   * @returns {OAuthCallbackError} Classified OAuth failure retaining the relevant operation context.
   */
  static authorizationError(
    error: AuthorizationResponseError,
    params: URLSearchParams,
    state?: string,
  ) {
    return new OAuthCallbackError(
      params,
      "OAuth Provider returned an error",
      state,
      error.cause,
    );
  }

  /**
   * Describes a callback that omitted the state query parameter.
   * @param {URLSearchParams} params - Query parameters received on the authorization callback.
   * @returns {OAuthCallbackError} Classified OAuth failure retaining the relevant operation context.
   */
  static stateMissing(params: URLSearchParams) {
    return new OAuthCallbackError(params, 'Missing "state" parameter.');
  }

  /**
   * Describes a callback whose state cannot be restored from the state store.
   * @param {string | null} stateParam - State identifier supplied by the authorization callback.
   * @param {URLSearchParams} params - Query parameters received on the authorization callback.
   * @returns {OAuthCallbackError} Classified OAuth failure retaining the relevant operation context.
   */
  static unknownAuthorizationState(
    stateParam: string | null,
    params: URLSearchParams,
  ) {
    return new OAuthCallbackError(
      params,
      `Unknown authorization session "${String(stateParam)}"`,
    );
  }

  /**
   * Describes an authorization callback that omitted its exchange code.
   * @param {URLSearchParams} params - Query parameters received on the authorization callback.
   * @param {string} appState - Opaque caller state retained across the authorization redirect.
   * @returns {OAuthCallbackError} Classified OAuth failure retaining the relevant operation context.
   */
  static codeMissing(params: URLSearchParams, appState?: string) {
    return new OAuthCallbackError(
      params,
      'Missing "code" query parameter.',
      appState,
    );
  }

  private constructor(
    public readonly params: URLSearchParams,
    message = callbackErrorDescription(params),
    public readonly state?: string,
    cause?: unknown,
  ) {
    super(message, { cause });
  }
}

/**
 * Refresh failure that carries explicit provider/recovery evidence so callers never classify
 * refresh behavior from message text.
 */
export class OAuthRefreshError extends Error {
  /**
   * Normalizes the supplied failure into the authored error contract.
   * @param {ResponseBodyError} err - Original OAuth failure to classify and preserve.
   * @returns {OAuthRefreshError} Classified OAuth failure retaining the relevant operation context.
   */
  static from(err: ResponseBodyError) {
    return new OAuthRefreshError(
      err.message,
      err.error_description,
      err.code,
      err.cause,
    );
  }

  /**
   * Describes a refresh attempt for an absent stored session.
   * @param {string} sessionId - Key identifying the stored OAuth session.
   * @returns {OAuthRefreshError} Classified OAuth failure retaining the relevant operation context.
   */
  static sessionNotFound(sessionId: string) {
    return new OAuthRefreshError(
      `No session found for key ID.`,
      undefined,
      undefined,
      {
        sessionId,
      },
    );
  }

  /**
   * Describes a session that cannot refresh because it has no refresh token.
   * @param {string} sessionId - Key identifying the stored OAuth session.
   * @returns {OAuthRefreshError} Classified OAuth failure retaining the relevant operation context.
   */
  static missingRefreshToken(sessionId: string) {
    return new OAuthRefreshError(
      `Session cannot be refreshed.`,
      "Missing refresh token",
      "MISSING_REFRESH_TOKEN",
      {
        sessionId,
      },
    );
  }

  /**
   * Describes an expired token that cannot be used for the requested operation.
   * @param {string} sessionId - Key identifying the stored OAuth session.
   * @returns {OAuthRefreshError} Classified OAuth failure retaining the relevant operation context.
   */
  static tokenExpired(sessionId: string) {
    return new OAuthRefreshError(
      "Refresh token cannot be refreshed",
      "Token expired",
      "REFRESH_TOKEN_EXPIRED",
      {
        sessionId,
      },
    );
  }

  private constructor(
    message = "Could not refresh session",
    public readonly description?: string,
    public readonly code?: string,
    cause?: unknown,
  ) {
    super(message, { cause });
  }
}

/**
 * Local access-token claim validation failure used when decoded authorization evidence
 * violates the configured client contract.
 */
export class OAuthClaimsError extends Error {
  /**
   * Describes an expired token that cannot be used for the requested operation.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static tokenExpired() {
    return new OAuthClaimsError("Access token has expired.");
  }

  /**
   * Describes an access token whose issue time is ahead of the validation clock.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static tokenIssuedInFuture() {
    return new OAuthClaimsError("Access token was issued in the future.");
  }

  /**
   * Describes an access token whose authentication time is ahead of the validation clock.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static tokenAuthenticationInFuture() {
    return new OAuthClaimsError(
      "Access token authentication time is in the future.",
    );
  }

  /**
   * Describes an access token issued before its recorded authentication time.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static issueTimeBeforeAuthenticationTime() {
    return new OAuthClaimsError(
      "Access token issue time is earlier than authentication time.",
    );
  }

  /**
   * Describes an access token issued by a different authorization server.
   * @param {string} issuer - Authorization-server issuer read from the token claims.
   * @param {string} expectedIssuer - Authorization-server issuer required by the caller.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static issuerMismatch(issuer: string, expectedIssuer: string) {
    return new OAuthClaimsError(
      `Access token issuer mismatch. Expected "${expectedIssuer}" but received "${issuer}".`,
    );
  }

  /**
   * Describes an access token registered to a different OAuth client.
   * @param {string} clientId - OAuth client identifier read from the token claims.
   * @param {string} expectedClientId - Registered OAuth application identifier required by the caller.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static clientIdMismatch(clientId: string, expectedClientId: string) {
    return new OAuthClaimsError(
      `Access token client_id mismatch. Expected "${expectedClientId}" but received "${clientId}".`,
    );
  }

  /**
   * Describes an access token whose audience omits the expected client.
   * @param {string} clientId - OAuth client identifier read from the token claims.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static audienceClientIdMissing(clientId: string) {
    return new OAuthClaimsError(
      `Access token audience does not include the expected client id "${clientId}".`,
    );
  }

  /**
   * Describes an access token whose audience omits the OAuth API.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static oauthApiMissing() {
    return new OAuthClaimsError(
      'Access token audience does not include "oauth-api".',
    );
  }

  /**
   * Describes an access token issued for a different service environment.
   * @param {string | undefined | null} environment - Service environment asserted by the token.
   * @param {string | null} expectedEnvironment - Service environment required by the caller.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static environmentMismatch(
    environment: string | undefined | null,
    expectedEnvironment: string | null,
  ) {
    return new OAuthClaimsError(
      `Access token environment mismatch. Expected "${String(expectedEnvironment)}" but received "${String(environment)}".`,
    );
  }

  /**
   * Describes an access token lacking a required permission.
   * @param {string} expectedScope - Permission required by the caller.
   * @returns {OAuthClaimsError} Classified OAuth failure retaining the relevant operation context.
   */
  static scopeMissing(expectedScope: string) {
    return new OAuthClaimsError(
      `Access token is missing required scope "${expectedScope}".`,
    );
  }
}

function callbackErrorDescription(params: URLSearchParams) {
  const description = params.get("error_description");

  return description === ""
    ? "OAuth callback error"
    : (description ?? "OAuth callback error");
}
