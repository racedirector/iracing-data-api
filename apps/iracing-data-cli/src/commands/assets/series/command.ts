import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Credential options accepted by the series-assets command. */
export type SeriesAssetsOptions = CredentialOptions;

/** Per-invocation capabilities required by the series-assets command handler. */
export interface SeriesAssetsCommandScope {
  /** Retrieves the selected asset metadata through the generated API client. */
  assets: {
    get(): Promise<unknown>;
  };

  /** Writes the command result to the configured destination. */
  output: {
    write(payload: unknown): void;
  };

  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;
}

/**
 * Factory contract for one isolated series-assets invocation scope.
 * @param {SeriesAssetsOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<SeriesAssetsCommandScope>} Resolved capabilities for one command invocation.
 */
export type CreateSeriesAssetsCommandScope = (
  options: SeriesAssetsOptions,
) => Promise<SeriesAssetsCommandScope>;

/** Application-registration dependencies for the series-assets command. */
export interface SeriesAssetsCommandDependencies {
  /** Resolves dependencies once for each command invocation. */
  createScope: CreateSeriesAssetsCommandScope;
}

/**
 * Build `iracing-data assets series` around one command-scoped dependency resolution.
 * @param {SeriesAssetsCommandDependencies} root0 - Command composition inputs and dependency overrides.
 * @param {CreateSeriesAssetsCommandScope} root0.createScope - Factory resolving dependencies once per command invocation.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createSeriesAssetsCommand({
  createScope,
}: SeriesAssetsCommandDependencies) {
  return new Command("series")
    .description("Fetch and materialize Data API series asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action(async (options) => {
      const { assets, output, diagnostics } = await createScope(options);

      const payload = await assets.get();

      output.write(payload);
      diagnostics.info("Series assets fetched.");
    });
}
