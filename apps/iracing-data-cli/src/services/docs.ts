/** Documentation execution independent of Commander and application infrastructure. */
import type { DocApi } from "@iracing-data/api-client-fetch";
import type { CredentialOptions } from "../credentials.js";
import type { Diagnostics } from "../diagnostics.js";
import type { TokenFormat, TokenOutputOptions } from "../token-output.js";

/** Validated invocation options supplied by the Commander adapter. */
export type DocsInput = Pick<CredentialOptions, "credentials"> &
  Pick<TokenOutputOptions, "output" | "force"> & { format: TokenFormat };

/** Preserve the generated documentation response without a parallel schema. */
type Documentation = Awaited<ReturnType<DocApi["getDocs"]>>;

/** The only contract Commander needs to dispatch the docs operation. */
export interface DocsService {
  execute(input: DocsInput): Promise<void>;
}

/** External operations supplied by the registrar, not resolved by the command. */
export interface DocsServiceDependencies {
  /** Emits secret-safe progress messages. */
  diagnostics: Pick<Diagnostics, "info">;
  /** Resolves the selected access token exactly once per invocation. */
  resolveAccessToken(options: CredentialOptions): Promise<string>;
  /** Provides an authenticated generated documentation client. */
  createApi(accessToken: string): { doc: Pick<DocApi, "getDocs"> };
  /** Publishes the document using the existing output policy. */
  writeDocumentOutput(
    document: Documentation,
    options: TokenOutputOptions,
  ): Promise<void>;
}

/** Extracts HTTP status only from a generated-client ResponseError. */
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

/** Maps only request failures to secret-safe recovery advice; retains the cause. */
function mapDocumentationError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      "Data API documentation request failed with HTTP " +
        String(status) +
        ". Check token expiry, iracing.auth scope and account access; obtain a new token with auth login.",
      { cause: error },
    );
  }

  if (status !== undefined) {
    return new Error(
      "Data API documentation request failed with HTTP " +
        String(status) +
        ". Try again; if the failure persists, check iRacing service availability.",
      { cause: error },
    );
  }

  return new Error(
    "Data API documentation request failed. Check network connectivity and try again.",
    { cause: error },
  );
}

/**
 * Compose the docs executor from explicit external dependencies.
 * No credential, HTTP, or output I/O occurs until execute is invoked.
 * @param {DocsServiceDependencies} services - Credential, API, output and diagnostic capabilities.
 * @returns {DocsService} Independently callable docs executor.
 */
export function makeDocsService(services: DocsServiceDependencies): DocsService {
  return {
    async execute(input) {
      const accessToken = await services.resolveAccessToken(input);
      const api = services.createApi(accessToken);

      let document: Documentation;

      try {
        document = await api.doc.getDocs();
      } catch (error) {
        throw mapDocumentationError(error);
      }

      await services.writeDocumentOutput(document, {
        ...input,
        outputLabel: "Documentation",
      });
      services.diagnostics.info("Data API documentation fetched.");
    },
  };
}
