/**
 * Data API documentation command boundary.
 *
 * `createDocsCommand()` is the Commander-facing orchestration layer. Each invocation
 * resolves a command scope from parsed CLI options, then hands only the capabilities
 * required by the implementation body to `runDocsCommand()`.
 *
 * The implementation body does not resolve credentials, construct generated clients,
 * inspect transport errors, or know how its dependencies are scoped. Those concerns
 * belong to the application-owned invocation scope in `docs-scope.ts`. This is the
 * manual composition shape a future DI container can implement without changing the
 * command body or exposing a container/service locator to it.
 */
import { Command } from "@commander-js/extra-typings";
import type { IracingServiceMethodDocs } from "@iracing-data/api-client-fetch";
import type { CredentialOptions } from "../credentials.js";
import type { Diagnostics } from "../diagnostics.js";
import type { TokenOutputOptions } from "../token-output.js";

export type DataApiDocumentation = Record<
  string,
  Record<string, IracingServiceMethodDocs>
>;

export type DocsOptions = TokenOutputOptions & CredentialOptions;

export interface DocsCommandScope {
  docs: {
    get(): Promise<DataApiDocumentation>;
  };
  output: {
    write(document: DataApiDocumentation): Promise<void>;
  };
  diagnostics: Diagnostics;
}

export type CreateDocsCommandScope = (
  options: DocsOptions,
) => Promise<DocsCommandScope>;

export interface DocsCommandDependencies {
  createScope: CreateDocsCommandScope;
}

export async function runDocsCommand({
  docs,
  output,
  diagnostics,
}: DocsCommandScope): Promise<void> {
  const document = await docs.get();
  await output.write(document);
  diagnostics.info("Data API documentation fetched.");
}

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
      const scope = await createScope(options);
      await runDocsCommand(scope);
    });
}
