import { AuthorizationResponseError, ResponseBodyError } from "oauth4webapi";

export class OAuthCallbackError extends Error {
  static from(err: unknown, params: URLSearchParams, state?: string) {
    if (err instanceof OAuthCallbackError) return err;
    const message = err instanceof Error ? err.message : undefined;
    return new OAuthCallbackError(params, message, state, err);
  }

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

  static stateMissing(params: URLSearchParams) {
    return new OAuthCallbackError(params, 'Missing "state" parameter.');
  }

  static unknownAuthorizationState(
    stateParam: string | null,
    params: URLSearchParams,
  ) {
    return new OAuthCallbackError(
      params,
      `Unknown authorization session "${stateParam}"`,
    );
  }

  static codeMissing(params: URLSearchParams, appState?: string) {
    return new OAuthCallbackError(
      params,
      'Missing "code" query parameter.',
      appState,
    );
  }

  private constructor(
    public readonly params: URLSearchParams,
    message = params.get("error_description") || "OAuth callback error",
    public readonly state?: string,
    cause?: unknown,
  ) {
    super(message, { cause });
  }
}

export class OAuthRefreshError extends Error {
  static from(err: ResponseBodyError) {
    return new OAuthRefreshError(
      err.message,
      err.error_description,
      err.code,
      err.cause,
    );
  }

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

  static tokenExpired(sessionId: string) {
    new OAuthRefreshError(
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

export class OAuthClaimsError extends Error {
  static tokenExpired() {
    return new OAuthClaimsError("Access token has expired.");
  }

  static tokenIssuedInFuture() {
    return new OAuthClaimsError("Access token was issued in the future.");
  }

  static tokenAuthenticationInFuture() {
    return new OAuthClaimsError(
      "Access token authentication time is in the future.",
    );
  }

  static issueTimeBeforeAuthenticationTime() {
    return new OAuthClaimsError(
      "Access token issue time is earlier than authentication time.",
    );
  }

  static issuerMismatch(issuer: string, expectedIssuer: string) {
    return new OAuthClaimsError(
      `Access token issuer mismatch. Expected "${expectedIssuer}" but received "${issuer}".`,
    );
  }

  static clientIdMismatch(clientId: string, expectedClientId: string) {
    return new OAuthClaimsError(
      `Access token client_id mismatch. Expected "${expectedClientId}" but received "${clientId}".`,
    );
  }

  static audienceClientIdMissing(clientId: string) {
    return new OAuthClaimsError(
      `Access token audience does not include the expected client id "${clientId}".`,
    );
  }

  static oauthApiMissing() {
    return new OAuthClaimsError(
      'Access token audience does not include "oauth-api".',
    );
  }

  static environmentMismatch(
    environment: string | undefined | null,
    expectedEnvironment: string | null,
  ) {
    return new OAuthClaimsError(
      `Access token environment mismatch. Expected "${expectedEnvironment}" but received "${environment}".`,
    );
  }

  static scopeMissing(expectedScope: string) {
    return new OAuthClaimsError(
      `Access token is missing required scope "${expectedScope}".`,
    );
  }
}
