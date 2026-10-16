import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Credential options accepted by the track-assets command. */
export type TrackAssetsOptions = CredentialOptions;

/** Per-invocation capabilities required by the track-assets command handler. */
export interface TrackAssetsCommandScope {
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
 * Factory contract for one isolated track-assets invocation scope.
 * @param {TrackAssetsOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<TrackAssetsCommandScope>} Resolved capabilities for one command invocation.
 */
export type CreateTrackAssetsCommandScope = (
  options: TrackAssetsOptions,
) => Promise<TrackAssetsCommandScope>;

/** Application-registration dependencies for the track-assets command. */
export interface TrackAssetsCommandDependencies {
  /** Resolves dependencies once for each command invocation. */
  createScope: CreateTrackAssetsCommandScope;
}

/**
 * Build `iracing-data assets track` around one command-scoped dependency resolution.
 * @param {TrackAssetsCommandDependencies} root0 - Command composition inputs and dependency overrides.
 * @param {CreateTrackAssetsCommandScope} root0.createScope - Factory resolving dependencies once per command invocation.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createTrackAssetsCommand({
  createScope,
}: TrackAssetsCommandDependencies) {
  return new Command("track")
    .description("Fetch and materialize Data API track asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action(async (options) => {
      const { assets, output, diagnostics } = await createScope(options);

      const payload = await assets.get();

      output.write(payload);
      diagnostics.info("Track assets fetched.");
    });
}
