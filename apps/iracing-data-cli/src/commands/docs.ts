/**
 * Fetch the authenticated Data API documentation through the generated client.
 *
 * The generated Data API client owns the modeled `/data/doc` wire contract:
 * endpoint paths, bearer-wire authentication, request serialization, transport,
 * and response models. The CLI owns credential selection, client composition,
 * command behavior, diagnostics, and output persistence.
 *
 * Keep the command dependent on the narrow `DocumentationApi` interface below so
 * tests can inject a typed fake. Repository-root scripts are build/audit tooling,
 * not application runtime dependencies or service-client abstractions.
 */
import { Command } from "@commander-js/extra-typings";
import type { IracingServiceMethodDocs } from "@iracing-data/api-client-fetch";
import { resolveAccessToken, type CredentialOptions } from "../credentials.js";
import {
  resolveTokenFormat,
  writeDocumentOutput,
  type TokenOutputOptions,
} from "../token-output.js";
import type { Diagnostics } from "../diagnostics.js";

export type DataApiDocumentation = Record<
  string,
  Record<string, IracingServiceMethodDocs>
>;

export interface DocumentationApi {
  getDocs(): Promise<DataApiDocumentation>;
}

export interface DocsDependencies {
  createDocumentationApi(accessToken: string): DocumentationApi;
}

type DocsOptions = TokenOutputOptions & CredentialOptions;

function responseStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || error.name !== "ResponseError") return undefined;
  const response = (error as Error & { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("status" in response))
    return undefined;
  const { status } = response as { status?: unknown };
  return typeof status === "number" ? status : undefined;
}

function documentationRequestError(error: unknown): Error {
  const status = responseStatus(error);
  if (status === 401 || status === 403)
    return new Error(
      `Data API documentation request failed with HTTP ${status}. Check token expiry, iracing.auth scope and account access; obtain a new token with auth login.`,
    );
  if (status !== undefined)
    return new Error(
      `Data API documentation request failed with HTTP ${status}. Try again; if the failure persists, check iRacing service availability.`,
    );
  return new Error(
    "Data API documentation request failed. Check network connectivity and try again.",
  );
}

export async function fetchDocs(
  options: DocsOptions,
  dependencies: DocsDependencies,
): Promise<DataApiDocumentation> {
  resolveTokenFormat(options.output, options.format);
  const token = await resolveAccessToken(options);
  const api = dependencies.createDocumentationApi(token);
  try {
    return await api.getDocs();
  } catch (error) {
    throw documentationRequestError(error);
  }
}

export function createDocsCommand({
  diagnostics,
  ...dependencies
}: DocsDependencies & { diagnostics: Diagnostics }) {
  return new Command("docs")
    .description("Fetch the complete authenticated Data API documentation once")
    .option(
      "-o, --output <path>",
      "Write documentation to a file instead of stdout",
    )
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .option("--format <json|yaml>", "Documentation serialization format")
    .option("--force", "Replace an existing output file")
    .action(async (options) => {
      const docs = await fetchDocs(options, dependencies);
      await writeDocumentOutput(docs, {
        ...options,
        outputLabel: "Documentation",
      });
      diagnostics.info("Data API documentation fetched.");
    });
}
