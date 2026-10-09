import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../credentials.js";
import {
  resolveTokenFormat,
  writeDocumentOutput,
  type TokenOutputOptions,
} from "../../token-output.js";
import type {
  CreateDocsCommandScope,
  DataApiDocumentation,
  DocsOptions,
} from "./command.js";
import type { Diagnostics } from "../../diagnostics.js";

interface DocumentationClient {
  getDocs(): Promise<DataApiDocumentation>;
}

export interface DocsScopeDependencies {
  resolveAccessToken(options: CredentialOptions): Promise<string>;
  createDocumentationClient(accessToken: string): DocumentationClient;
  writeDocumentOutput(
    document: DataApiDocumentation,
    options: TokenOutputOptions,
  ): Promise<void>;
}

const defaultDependencies: DocsScopeDependencies = {
  resolveAccessToken,
  /** Create a documentation client using a token without the Bearer prefix. */
  createDocumentationClient(accessToken) {
    return new DocApi(new Configuration({ accessToken }));
  },
  writeDocumentOutput,
};

/**
 * Read a numeric response status from an Error named ResponseError, returning
 * undefined for other error shapes.
 */
function responseStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || error.name !== "ResponseError")
    return undefined;
  const response = (error as Error & { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("status" in response))
    return undefined;
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
 * Return a factory that creates a dependency scope per `iracing-data docs` invocation.
 *
 * This is intentionally command-scoped manual composition: resolve invocation
 * credentials and output policy once, construct the generated client once, and expose
 * only the capabilities the command handler requires. A future DI framework can
 * replace this factory without changing the command module's public registration API.
 *
 * The returned factory rejects unsupported formats before resolving credentials.
 * Credential resolution and client construction failures propagate unchanged;
 * documentation retrieval and output are deferred to the returned capabilities.
 */
export function createDocsCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: DocsScopeDependencies = defaultDependencies,
): CreateDocsCommandScope {
  return async (options: DocsOptions) => {
    resolveTokenFormat(options.output, options.format);
    const accessToken = await dependencies.resolveAccessToken(options);
    const api = dependencies.createDocumentationClient(accessToken);

    return {
      docs: {
        /**
         * Retrieve documentation on each call, replacing request or decoding
         * failures with recovery advice from mapDocumentationError.
         */
        async get(): Promise<DataApiDocumentation> {
          try {
            return await api.getDocs();
          } catch (error) {
            throw mapDocumentationError(error);
          }
        },
      },
      output: {
        /**
         * Write documentation using the invocation's output options, propagating
         * writer failures. The default writer emits JSON or YAML to stdout or a
         * private file and refuses to replace an existing file without force.
         */
        async write(document) {
          await dependencies.writeDocumentOutput(document, {
            ...options,
            outputLabel: "Documentation",
          });
        },
      },
      diagnostics,
    };
  };
}
