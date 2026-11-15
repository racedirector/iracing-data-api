import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import { resolveAccessToken } from "../../credentials.js";
import { resolveTokenFormat } from "../../token-output.js";
import type { CreateExecuteOptions } from "./command.js";
import type { writeDocumentOutput } from "../../token-output.js";
import type { Diagnostics } from "../../types.js";

/** Host transport, output policy and completion diagnostics. */
export interface DocsRuntime {
  /** HTTP transport for the generated documentation client. */
  fetch: typeof fetch;

  /** Shared JSON/YAML document writer. */
  writeDocumentOutput: typeof writeDocumentOutput;

  /** Secret-safe completion diagnostics. */
  diagnostics: Diagnostics;
}

/**
 * Bind validation, authentication, one modeled request, and document output.
 * @param {DocsRuntime} runtime - Host transport, writer and diagnostics.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createDocsService(runtime: DocsRuntime): CreateExecuteOptions {
  return {
    async fetchDocs(options) {
      resolveTokenFormat(options.output, options.format);
      const accessToken = await resolveAccessToken(options);

      const api = new DocApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      let document;

      try {
        document = await api.getDocs();
      } catch (error) {
        throw mapDocumentationError(error);
      }

      await runtime.writeDocumentOutput(document, {
        ...options,
        outputLabel: "Documentation",
      });
    },
    present() {
      runtime.diagnostics.info("Data API documentation fetched.");
    },
  };
}

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
    );
  }

  if (status !== undefined) {
    return new Error(
      `Data API documentation request failed with HTTP ${String(status)}. Try again; if the failure persists, check iRacing service availability.`,
    );
  }

  return new Error(
    "Data API documentation request failed. Check network connectivity and try again.",
  );
}
