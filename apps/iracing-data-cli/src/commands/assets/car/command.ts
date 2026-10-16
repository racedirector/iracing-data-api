import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Credential options accepted by the car-assets command. */
export type CarAssetsOptions = CredentialOptions;

/** Per-invocation capabilities required by the car-assets command handler. */
export interface CarAssetsCommandScope {
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
 * Factory contract for one isolated car-assets invocation scope.
 * @param {CarAssetsOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<CarAssetsCommandScope>} Resolved capabilities for one command invocation.
 */
export type CreateCarAssetsCommandScope = (
  options: CarAssetsOptions,
) => Promise<CarAssetsCommandScope>;

/** Application-registration dependencies for the car-assets command. */
export interface CarAssetsCommandDependencies {
  /** Resolves dependencies once for each command invocation. */
  createScope: CreateCarAssetsCommandScope;
}

/**
 * Build `iracing-data assets car` around one command-scoped dependency resolution.
 * @param {CarAssetsCommandDependencies} root0 - Command composition inputs and dependency overrides.
 * @param {CreateCarAssetsCommandScope} root0.createScope - Factory resolving dependencies once per command invocation.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createCarAssetsCommand({
  createScope,
}: CarAssetsCommandDependencies) {
  return new Command("car")
    .description("Fetch and materialize Data API car asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action(async (options) => {
      const { assets, output, diagnostics } = await createScope(options);

      const payload = await assets.get();

      output.write(payload);
      diagnostics.info("Car assets fetched.");
    });
}
