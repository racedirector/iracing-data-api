import {
  FetchError,
  RequiredError,
  ResponseError,
} from "@iracing-data/api-client-fetch";
import {
  ClientMetadataError,
  OAuthClaimsError,
  OAuthRefreshError,
  OAuthTokenDocumentError,
  SessionNotFoundError,
} from "@iracing-data/oauth-client";
import {
  ApplicationFailure,
  ProtocolFailure,
  type FailureDomain,
} from "./errors.js";

export interface MappingContext {
  readonly domain: FailureDomain;
  /** Only set when the gateway has confirmed account entitlement denial. */
  readonly upstreamAuthorization?: "account_entitlement";
  /** Set by the future session owner from lifecycle evidence, never an error message. */
  readonly refreshOutcome?:
    "safe_to_retry" | "rotation_uncertain" | "persistence_failed";
}

/** Minimal seams only: no body reads, message matching, cause traversal, or refresh. */
export function mapFailure(
  error: unknown,
  context: MappingContext,
): ApplicationFailure | ProtocolFailure {
  if (context.domain === "http" || context.domain === "mcp_protocol")
    return new ProtocolFailure(context.domain);
  if (error instanceof ApplicationFailure) return error;
  if (
    context.domain === "configuration" ||
    error instanceof ClientMetadataError
  )
    return new ApplicationFailure("CONFIGURATION_ERROR");
  if (context.domain === "oauth_session") {
    if (context.refreshOutcome === "persistence_failed")
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "persistence_failed",
      });
    if (context.refreshOutcome === "rotation_uncertain")
      return new ApplicationFailure("TOKEN_REFRESH_FAILED", {
        reason: "rotation_uncertain",
      });
    if (error instanceof SessionNotFoundError)
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "missing_session",
      });
    if (
      error instanceof OAuthClaimsError ||
      error instanceof OAuthTokenDocumentError
    )
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "invalid_session",
      });
    if (
      error instanceof OAuthRefreshError &&
      [
        "invalid_grant",
        "MISSING_REFRESH_TOKEN",
        "REFRESH_TOKEN_EXPIRED",
      ].includes(error.code ?? "")
    )
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "revoked_authorization",
      });
    return new ApplicationFailure("TOKEN_REFRESH_FAILED", {
      reason:
        context.refreshOutcome === "safe_to_retry"
          ? "transient_refresh"
          : "rotation_uncertain",
    });
  }
  if (context.domain === "upstream") {
    if (
      error instanceof RequiredError ||
      (error instanceof Error && error.name === "RequiredError")
    )
      return new ApplicationFailure("INVALID_INPUT");
    if (
      error instanceof FetchError ||
      (error instanceof Error && error.name === "FetchError")
    )
      return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
    // The generated ES5 Error subclasses lose their subclass prototype at runtime.
    // Use their stable discriminator plus a real Response; never inspect a body/cause.
    const response =
      error instanceof Error && error.name === "ResponseError"
        ? Object.getOwnPropertyDescriptor(error, "response")?.value
        : undefined;
    if (error instanceof ResponseError || response instanceof Response) {
      const upstreamResponse: Response =
        response ?? (error as ResponseError).response;
      const status = upstreamResponse.status;
      if (status === 401 || status === 403)
        return new ApplicationFailure("UPSTREAM_UNAUTHORIZED", {
          reason:
            context.upstreamAuthorization === "account_entitlement"
              ? "account_entitlement"
              : "upstream_access_denied",
        });
      if (status === 404) return new ApplicationFailure("NOT_FOUND");
      if (status === 429) {
        const header = upstreamResponse.headers.get("retry-after");
        // Delta seconds only. HTTP dates require a clock and are deferred to the gateway.
        const seconds =
          header && /^\d{1,6}$/.test(header) ? Number(header) : undefined;
        return new ApplicationFailure("RATE_LIMITED", {
          retry_after_seconds: seconds,
        });
      }
      if (status >= 500 || status === 408)
        return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
      return new ApplicationFailure("DATA_RESOLUTION_FAILED", {
        reason: "invalid_data",
      });
    }
    if (error instanceof SyntaxError)
      return new ApplicationFailure("DATA_RESOLUTION_FAILED", {
        reason: "invalid_data",
      });
  }
  return new ApplicationFailure("INTERNAL_ERROR");
}
