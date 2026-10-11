/**
 * Commander-facing docs command adapter.
 *
 * This file owns only command parsing/orchestration and the implementation body.
 * Scope construction is intentionally supplied from the docs module entry point so
 * consumers never need to know how the command's invocation scope is composed.
 */
import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../credentials.js";
import type { Diagnostics } from "../../diagnostics.js";
import type { TokenOutputOptions } from "../../token-output.js";
import type { IracingServiceMethodDocs } from "@iracing-data/api-client-fetch";

/**
 * Nested service-to-method documentation projection returned by the maintained Data API
 * documentation owner.
 */
export type DataApiDocumentation = Record<
  string,
  Record<string, IracingServiceMethodDocs>
>;

/** Command options that combine credential resolution with the shared document-output policy. */
export type DocsOptions = TokenOutputOptions & CredentialOptions;

/**
 * Per-invocation boundary for retrieving documentation, writing output, and reporting
 * diagnostics.
 */
export interface DocsCommandScope {
  docs: {
    get(): Promise<DataApiDocumentation>;
  };
  output: {
    write(document: DataApiDocumentation): Promise<void>;
  };
  diagnostics: Diagnostics;
}

/**
 * Factory contract for creating an isolated documentation-command scope from normalized
 * options.
 */
export type CreateDocsCommandScope = (
  options: DocsOptions,
) => Promise<DocsCommandScope>;

/**
 * Application-registration dependencies for the docs command; service access remains inside
 * the invocation scope.
 */
export interface DocsCommandDependencies {
  createScope: CreateDocsCommandScope;
}

/**
 * Build the docs command, resolving a fresh scope when its async action runs.
 * The action fetches documentation once and writes it through that scope;
 * scope creation, retrieval, and output failures reject `parseAsync()`.
 */
export function createDocsCommand({ createScope }: DocsCommandDependencies) {
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
      const { docs, output, diagnostics } = await createScope(options);
      const document = await docs.get();
      await output.write(document);
      diagnostics.info("Data API documentation fetched.");
    });
}
