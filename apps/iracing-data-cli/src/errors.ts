/** Shared, secret-safe error translation for iRacing Data API requests. */

/** Operation-specific context required to provide actionable recovery advice. */
export interface DataApiRequestErrorContext {
  /** Human-readable API operation, such as documentation or car assets. */
  operation: string;

  /** Required OAuth scope when the operation mandates a specific scope. */
  requiredScope?: string;
}

/** A public-safe Data API failure retaining its original internal cause. */
export class DataApiRequestError extends Error {
  /** Explicit safe error category for callers and error reporters. */
  override readonly name = "DataApiRequestError";

  /**
   * Construct a safe, contextual API request failure.
   * @param {string} message - Secret-safe diagnostic text.
   * @param {unknown} cause - Original SDK or transport failure.
   * @param {number | undefined} status - HTTP response code when known.
   */
  constructor(
    message: string,
    cause: unknown,
    readonly status?: number,
  ) {
    super(message, { cause });
  }
}

/**
 * Extract a numeric status from the generated client's ResponseError.
 * @param {unknown} error - Potential SDK request failure.
 * @returns {number | undefined} Recognized HTTP status, if any.
 */
function responseStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || error.name !== "ResponseError") {
    return undefined;
  }

  const response = (error as Error & { response?: unknown }).response;

  if (!response || typeof response !== "object" || !("status" in response)) {
    return undefined;
  }

  const { status } = response as { status?: unknown };

  return typeof status === "number" ? status : undefined;
}

/**
 * Translate only an API request failure, without exposing upstream response data.
 * Call this inside the generated request catch block, not around credential I/O
 * or document persistence.
 * @param {unknown} error - Original request failure.
 * @param {DataApiRequestErrorContext} context - Operation and scope information.
 * @returns {DataApiRequestError} Safe public error retaining the internal cause.
 */
export function mapDataApiRequestError(
  error: unknown,
  context: DataApiRequestErrorContext,
): DataApiRequestError {
  const status = responseStatus(error);

  const prefix = "Data API " + context.operation + " request failed";

  if (status === 401 || status === 403) {
    const scope = context.requiredScope
      ? ", " + context.requiredScope + " scope"
      : "";

    return new DataApiRequestError(
      prefix +
        " with HTTP " +
        String(status) +
        ". Check token expiry" +
        scope +
        " and account access; obtain a new token with auth login.",
      error,
      status,
    );
  }

  if (status !== undefined) {
    return new DataApiRequestError(
      prefix +
        " with HTTP " +
        String(status) +
        ". Try again; if the failure persists, check iRacing service availability.",
      error,
      status,
    );
  }

  return new DataApiRequestError(
    prefix + ". Check network connectivity and try again.",
    error,
  );
}
