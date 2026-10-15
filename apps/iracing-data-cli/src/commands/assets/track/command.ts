import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Credential options accepted by the track-assets command. */
export type TrackAssetsOptions = CredentialOptions;

/** Per-invocation capabilities required by the track-assets command handler. */
export interface TrackAssetsCommandScope {
  assets: {
    get(): Promise<unknown>;
  };
  output: {
    write(payload: unknown): void;
  };
  diagnostics: Diagnostics;
}

/** Factory contract for one isolated track-assets invocation scope. */
export type CreateTrackAssetsCommandScope = (
  options: TrackAssetsOptions,
) => Promise<TrackAssetsCommandScope>;

/** Application-registration dependencies for the track-assets command. */
export interface TrackAssetsCommandDependencies {
  createScope: CreateTrackAssetsCommandScope;
}

/** Build `iracing-data assets track` around one command-scoped dependency resolution. */
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
