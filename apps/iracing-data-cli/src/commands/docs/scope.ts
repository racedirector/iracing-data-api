import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../credentials.js";
import type { Diagnostics } from "../../diagnostics.js";
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
  createDocumentationClient(accessToken) {
    return new DocApi(new Configuration({ accessToken }));
  },
  writeDocumentOutput,
};

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
  dependencies: DocsScopeDependencies = defaultDependencies,
): CreateDocsCommandScope {
  return async (options: DocsOptions) => {
    resolveTokenFormat(options.output, options.format);
    const accessToken = await dependencies.resolveAccessToken(options);
    const api = dependencies.createDocumentationClient(accessToken);

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
