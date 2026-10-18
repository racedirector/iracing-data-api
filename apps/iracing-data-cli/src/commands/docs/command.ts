/** Commander adapter: validate docs input and dispatch its execution. */
import { Command } from "@commander-js/extra-typings";
import { OptionsSchema } from "./schema.js";
import type { DocsService } from "./service.js";

/**
 * Register the docs command without credential, network or output I/O.
 * @param {DocsService} service - Command's independently callable executor.
 * @returns {Command} Configured docs command.
 */
export function createDocsCommand(service: DocsService) {
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
    .action((options) => service.execute(OptionsSchema.parse(options)));
}
