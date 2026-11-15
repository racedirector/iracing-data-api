import { Command } from "@commander-js/extra-typings";
import { readCredentialOptions } from "../../schema.js";
import { type Options, resolveOptions } from "./schema.js";

/** Host-owned documentation retrieval, output and completion reporting. */
export interface CreateExecuteOptions {
  /**
   * Fetch and write the documentation using the selected output policy.
   * @param {Options} options - Parsed output and API credential options.
   * @returns {Promise<void>} Completion after the documentation is written.
   */
  fetchDocs(options: Options): Promise<void>;

  /** Report completion only after output succeeds. */
  present(): void;
}

/**
 * Bind documentation retrieval to completion reporting.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: Options) => {
    await service.fetchDocs(options);
    service.present();
  };
}

/**
 * Parse docs flags and call the injected service.
 * @param {CreateExecuteOptions} service - Host retrieval and presentation.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createDocsCommand(service: CreateExecuteOptions): Command {
  const execute = createExecute(service);

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
    .action(async (raw, command) => {
      const options = resolveOptions.parse({
        ...raw,
        ...readCredentialOptions(command),
      });

      await execute(options);
    });
}
