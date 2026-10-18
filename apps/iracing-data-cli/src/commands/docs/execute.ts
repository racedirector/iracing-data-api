/** Direct documentation retrieval and output, independent of Commander. */
import type { DocsOptions } from "./command.js";
import type { Diagnostics } from "../../diagnostics.js";
import type { TokenOutputOptions } from "../../token-output.js";
import type { DocApi } from "@iracing-data/api-client-fetch";

/** The generated operation owns the documentation response shape; preserve it verbatim. */
type DataApiDocumentation = Awaited<ReturnType<DocApi["getDocs"]>>;

/**
 * Read a numeric response status from an Error named ResponseError, returning
 * undefined for other error shapes.
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
 * Return a new error with authentication advice for HTTP 401/403, service advice
 * for other recognized statuses, or network advice otherwise. Original messages
 * and response bodies are omitted, including for non-HTTP failures.
 */
function mapDocumentationError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Data API documentation request failed with HTTP ${String(status)}. Check token expiry, iracing.auth scope and account access; obtain a new token with auth login.`,
      { cause: error },
    );
  }

  if (status !== undefined) {
    return new Error(
      `Data API documentation request failed with HTTP ${String(status)}. Try again; if the failure persists, check iRacing service availability.`,
      { cause: error },
    );
  }

  return new Error(
    "Data API documentation request failed. Check network connectivity and try again.",
    { cause: error },
  );
}

/**
 * Fetch documentation once, write it, then report successful completion.
 * @param {DocsOptions} options - Existing credential and output options.
 * @param {object} context - Resolved invocation context.
 * @param {string} context.accessToken - Validated bearer token.
 * @param {Diagnostics} context.diagnostics - Secret-safe progress sink.
 * @param {object} io - Required documentation retrieval and output operations, supplied by the caller.
 * @param {Function} io.fetchDocumentation - Retrieve documentation using the resolved token.
 * @param {Function} io.writeDocumentOutput - Shared output writer.
 * @returns {Promise<void>} Completion after output and success diagnostics.
 */
export async function executeDocs(
  options: DocsOptions,
  context: { accessToken: string; diagnostics: Diagnostics },
  io: {
    fetchDocumentation: (accessToken: string) => Promise<DataApiDocumentation>;
    writeDocumentOutput: (
      document: DataApiDocumentation,
      options: TokenOutputOptions,
    ) => Promise<void>;
  },
): Promise<void> {
  let document: DataApiDocumentation;

  try {
    document = await io.fetchDocumentation(context.accessToken);
  } catch (error) {
    throw mapDocumentationError(error);
  }

  await io.writeDocumentOutput(document, {
    ...options,
    outputLabel: "Documentation",
  });
  context.diagnostics.info("Data API documentation fetched.");
}
