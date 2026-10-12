/**
 * Failure normalization between OAuth, generated Fetch and app boundaries.
 *
 * Map known types and explicit context evidence without reading response bodies,
 * matching messages, recursively walking causes or attempting refresh. Session
 * rotation/consumption evidence belongs to the session owner; HTTP status alone
 * cannot establish safe retry. Protocol failures use their own fixed projection.
 * Unknown failures fall back to safe app errors rather than exposing raw causes.
 */
import {
  ApplicationFailure,
  mapDataApiFailure as mapPackageFailure,
  ProtocolFailure,
  type FailureDomain,
} from "@iracing-data/mcp-server";
import {
  ClientMetadataError,
  OAuthClaimsError,
  OAuthRefreshError,
  OAuthTokenDocumentError,
  SessionNotFoundError,
} from "@iracing-data/oauth-client";

/**
 * Explicit domain and authorization evidence used to classify failures without inferring
 * semantics from exception text.
 */
export interface MappingContext {
  readonly domain: FailureDomain;

  /** Only set when the gateway has confirmed account entitlement denial. */
  readonly upstreamAuthorization?: "account_entitlement";

  /** Set by the session owner from lifecycle evidence, never an error message. */
  readonly refreshOutcome?:
    "safe_to_retry" | "rotation_uncertain" | "persistence_failed";
}

/** Minimal seams only: no body reads, message matching, recursive causes, or refresh. */
export function mapFailure(
  error: unknown,
  context: MappingContext,
): ApplicationFailure | ProtocolFailure {
  if (context.domain === "http" || context.domain === "mcp_protocol") {
    return new ProtocolFailure(context.domain);
  }

  if (error instanceof ApplicationFailure) {
    return error;
  }

  if (
    context.domain === "configuration" ||
    error instanceof ClientMetadataError
  ) {
    return new ApplicationFailure("CONFIGURATION_ERROR");
  }

  if (context.domain === "oauth_session") {
    if (context.refreshOutcome === "persistence_failed") {
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "persistence_failed",
      });
    }

    if (context.refreshOutcome === "rotation_uncertain") {
      return new ApplicationFailure("TOKEN_REFRESH_FAILED", {
        reason: "rotation_uncertain",
      });
    }

    if (error instanceof SessionNotFoundError) {
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "missing_session",
      });
    }

    if (
      error instanceof OAuthClaimsError ||
      error instanceof OAuthTokenDocumentError
    ) {
      return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
        reason: "invalid_session",
      });
    }

    if (error instanceof OAuthRefreshError) {
      // OAuthRefreshError.from retains oauth4webapi's library code, not its
      // OAuth error identifier. Inspect only the exact retained discriminator.
      const cause = Object.getOwnPropertyDescriptor(error, "cause")?.value;

      const oauthCode =
        error.code === "OAUTH_RESPONSE_BODY_ERROR" &&
        cause !== null &&
        typeof cause === "object"
          ? Object.getOwnPropertyDescriptor(cause, "error")?.value
          : undefined;

      if (
        [
          "invalid_grant",
          "MISSING_REFRESH_TOKEN",
          "REFRESH_TOKEN_EXPIRED",
        ].includes(error.code ?? "") ||
        oauthCode === "invalid_grant"
      ) {
        return new ApplicationFailure("AUTHORIZATION_REQUIRED", {
          reason: "revoked_authorization",
        });
      }
    }

    return new ApplicationFailure("TOKEN_REFRESH_FAILED", {
      reason:
        context.refreshOutcome === "safe_to_retry"
          ? "transient_refresh"
          : "rotation_uncertain",
    });
  }

  return mapPackageFailure(error, context);
}
