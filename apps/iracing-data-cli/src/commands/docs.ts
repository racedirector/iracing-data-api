/** Commander adapter: parse and validate docs input, then dispatch it. */
import { Command } from "@commander-js/extra-typings";
import { resolveTokenFormat } from "../token-output.js";
import type { DocsService } from "../services/docs.js";

/**
 * Register the docs command without credential, network or output I/O.
 * @param {DocsService} service - Injected application executor.
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
    .action((options) =>
      service.execute({
        ...options,
        format: resolveTokenFormat(options.output, options.format),
      }),
    );
}
