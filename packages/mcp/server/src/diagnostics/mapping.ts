/**
 * Failure normalization between generated Fetch and tool boundaries.
 *
 * Map known types and explicit context evidence without reading response bodies,
 * matching messages, recursively walking causes or attempting refresh. Session
 * rotation/consumption evidence belongs to the session owner; HTTP status alone
 * cannot establish safe retry. Protocol failures use their own fixed projection.
 * Unknown failures fall back to safe app errors rather than exposing raw causes.
 */
import {
  FetchError,
  RequiredError,
  ResponseError,
} from "@iracing-data/api-client-fetch";
import {
  ApplicationFailure,
  ProtocolFailure,
  type FailureDomain,
} from "./errors.js";

/**
 * Explicit domain and authorization evidence used to classify failures without inferring
 * semantics from exception text.
 */
export interface MappingContext {
  readonly domain: FailureDomain;

  /** Only set when the gateway has confirmed account entitlement denial. */
  readonly upstreamAuthorization?: "account_entitlement";
}

/** Minimal seams only: no body reads, message matching, recursive causes, or refresh. */
export function mapDataApiFailure(
  error: unknown,
  context: MappingContext,
): ApplicationFailure | ProtocolFailure {
  if (context.domain === "http" || context.domain === "mcp_protocol") {
    return new ProtocolFailure(context.domain);
  }

  if (error instanceof ApplicationFailure) {
    return error;
  }

  if (context.domain === "configuration") {
    return new ApplicationFailure("CONFIGURATION_ERROR");
  }

  if (context.domain === "upstream") {
    if (
      error instanceof RequiredError ||
      (error instanceof Error && error.name === "RequiredError")
    ) {
      return new ApplicationFailure("INVALID_INPUT");
    }

    if (
      error instanceof FetchError ||
      (error instanceof Error && error.name === "FetchError")
    ) {
      return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
    }

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

      if (status === 401 || status === 403) {
        return new ApplicationFailure("UPSTREAM_UNAUTHORIZED", {
          reason:
            context.upstreamAuthorization === "account_entitlement"
              ? "account_entitlement"
              : "upstream_access_denied",
        });
      }

      if (status === 404) {
        return new ApplicationFailure("NOT_FOUND");
      }

      if (status === 429) {
        const header = upstreamResponse.headers.get("retry-after");

        // Delta seconds only. HTTP dates require a clock and are deferred to the gateway.
        const seconds =
          header && /^\d{1,6}$/.test(header) ? Number(header) : undefined;

        return new ApplicationFailure("RATE_LIMITED", {
          retry_after_seconds: seconds,
        });
      }

      if (status >= 500 || status === 408) {
        return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
      }

      return new ApplicationFailure("DATA_RESOLUTION_FAILED", {
        reason: "invalid_data",
      });
    }

    if (error instanceof SyntaxError) {
      return new ApplicationFailure("DATA_RESOLUTION_FAILED", {
        reason: "invalid_data",
      });
    }
  }

  return new ApplicationFailure("INTERNAL_ERROR");
}
