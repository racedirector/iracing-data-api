import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import { resolveAccessToken } from "../credentials.js";
import type { Diagnostics } from "../diagnostics.js";
import { resolveTokenFormat, writeDocumentOutput } from "../token-output.js";
import type {
  CreateDocsCommandScope,
  DataApiDocumentation,
  DocsOptions,
} from "./docs.js";

function responseStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || error.name !== "ResponseError") return undefined;
  const response = (error as Error & { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("status" in response))
    return undefined;
  const { status } = response as { status?: unknown };
  return typeof status === "number" ? status : undefined;
}

function mapDocumentationError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Data API documentation request failed with HTTP ${status}. Check token expiry, iracing.auth scope and account access; obtain a new token with auth login.`,
    );
  }

  if (status !== undefined) {
    return new Error(
      `Data API documentation request failed with HTTP ${status}. Try again; if the failure persists, check iRacing service availability.`,
    );
  }

  return new Error(
    "Data API documentation request failed. Check network connectivity and try again.",
  );
}

/**
 * Create the per-invocation dependency scope for `iracing-data docs`.
 *
 * This is intentionally command-scoped manual composition: resolve invocation
 * credentials and output policy once, construct the generated client once, and expose
 * only the capabilities the command implementation requires. A future DI framework
 * can replace this factory without changing `runDocsCommand()`.
 */
export function createDocsCommandScopeFactory(
  diagnostics: Diagnostics,
): CreateDocsCommandScope {
  return async (options: DocsOptions) => {
    resolveTokenFormat(options.output, options.format);
    const accessToken = await resolveAccessToken(options);
    const api = new DocApi(new Configuration({ accessToken }));

    return {
      docs: {
        async get(): Promise<DataApiDocumentation> {
          try {
            return await api.getDocs();
          } catch (error) {
            throw mapDocumentationError(error);
          }
        },
      },
      output: {
        async write(document) {
          await writeDocumentOutput(document, {
            ...options,
            outputLabel: "Documentation",
          });
        },
      },
      diagnostics,
    };
  };
}
