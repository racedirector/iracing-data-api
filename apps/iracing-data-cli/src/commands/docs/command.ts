/** Commander adapter: validate output, resolve credentials, and execute docs. */
import { Command } from "@commander-js/extra-typings";
import {
  resolveTokenFormat,
  type TokenOutputOptions,
} from "../../token-output.js";
import type { CredentialOptions } from "../../credentials.js";
import type { Diagnostics } from "../../diagnostics.js";

/** Existing credential and document-output options. */
export type DocsOptions = TokenOutputOptions & CredentialOptions;

/**
 * Register without I/O; dependencies run only when the action is invoked.
 * @param {object} root0 - Direct command dependencies.
 * @param {Diagnostics} root0.diagnostics - Secret-safe progress sink.
 * @param {Function} root0.resolveAccessToken - Invocation token resolver.
 * @param {Function} root0.execute - Direct documentation executor.
 * @returns {Command} Configured docs command.
 */
export function createDocsCommand({
  diagnostics,
  resolveAccessToken: resolveToken,
  execute,
}: {
  diagnostics: Diagnostics;
  resolveAccessToken: (options: CredentialOptions) => Promise<string>;
  execute: (
    options: DocsOptions,
    context: { accessToken: string; diagnostics: Diagnostics },
  ) => Promise<void>;
}) {
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
      resolveTokenFormat(options.output, options.format);
      const accessToken = await resolveToken(options);

      await execute(options, { accessToken, diagnostics });
    });
}
