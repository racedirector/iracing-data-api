/** Generated Fetch error translation belongs to the concrete Fetch adapter. */
import {
  FetchError,
  RequiredError,
  ResponseError,
} from "@iracing-data/api-client-fetch";
import { ApplicationFailure } from "@iracing-data/mcp";

/**
 * Convert generated client transport failures to bounded application errors.
 * Never read signed-link response bodies, exception messages or credentials.
 * @param {unknown} error - Failure from the generated API or signed-link fetch.
 * @returns {ApplicationFailure} Safe error code for the MCP tool.
 */
export function mapUpstreamFailure(
  error: unknown,
): ApplicationFailure {
  if (error instanceof ApplicationFailure) {
    return error;
  }

  if (error instanceof RequiredError || namedError(error, "RequiredError")) {
    return new ApplicationFailure("INVALID_INPUT");
  }

  if (error instanceof FetchError || namedError(error, "FetchError")) {
    return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
  }

  // The generated ES5 Error subclasses lose their subclass prototype at runtime.
  // Use their stable discriminator plus a real Response; never inspect a body/cause.
  const response: unknown = namedError(error, "ResponseError")
    ? Object.getOwnPropertyDescriptor(error, "response")?.value
    : undefined;

  if (error instanceof ResponseError || response instanceof Response) {
    const upstreamResponse: Response =
      response instanceof Response
        ? response
        : (error as ResponseError).response;

    return mapResponseFailure(upstreamResponse);
  }

  if (error instanceof SyntaxError) {
    return new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  }

  return new ApplicationFailure("INTERNAL_ERROR");
}

function mapResponseFailure(
  upstreamResponse: Response,
): ApplicationFailure {
  const status = upstreamResponse.status;

  if (status === 401 || status === 403) {
    return new ApplicationFailure("UPSTREAM_UNAUTHORIZED", {
      reason: "upstream_access_denied",
    });
  }

  if (status === 404) {
    return new ApplicationFailure("NOT_FOUND");
  }

  if (status === 429) {
    const header = upstreamResponse.headers.get("retry-after");

    // Delta seconds only. HTTP dates require a clock and are not inferred here.
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

function namedError(error: unknown, name: string): error is Error {
  return error instanceof Error && error.name === name;
}

