/** Direct documentation retrieval and output, independent of Commander. */
import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import { writeDocumentOutput } from "../../token-output.js";
import type { DocsOptions } from "./command.js";
import type { Diagnostics } from "../../diagnostics.js";

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
 * @param {object} io - Executor-local client and writer overrides.
 * @param {Function} io.createDocumentationClient - Construct the generated client.
 * @param {typeof writeDocumentOutput} io.writeDocumentOutput - Shared output writer.
 * @returns {Promise<void>} Completion after output and success diagnostics.
 */
export async function executeDocs(
  options: DocsOptions,
  context: { accessToken: string; diagnostics: Diagnostics },
  io: {
    createDocumentationClient: (accessToken: string) => Pick<DocApi, "getDocs">;
    writeDocumentOutput: typeof writeDocumentOutput;
  } = {
    createDocumentationClient: (accessToken) =>
      new DocApi(new Configuration({ accessToken })),
    writeDocumentOutput,
  },
): Promise<void> {
  const api = io.createDocumentationClient(context.accessToken);

  let document: Awaited<ReturnType<DocApi["getDocs"]>>;

  try {
    document = await api.getDocs();
  } catch (error) {
    throw mapDocumentationError(error);
  }

  await io.writeDocumentOutput(document, {
    ...options,
    outputLabel: "Documentation",
  });
  context.diagnostics.info("Data API documentation fetched.");
}
