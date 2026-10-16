import { Command } from "@commander-js/extra-typings";
import {
  createCarAssetsCommand,
  type CarAssetsScopeDependencies,
} from "./car/index.js";
import {
  createSeriesAssetsCommand,
  type SeriesAssetsScopeDependencies,
} from "./series/index.js";
import {
  createTrackAssetsCommand,
  type TrackAssetsScopeDependencies,
} from "./track/index.js";
import type { Diagnostics } from "../../diagnostics.js";

/** Composition inputs for the structural assets command group. */
export interface CreateAssetsCommandOptions {
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional car-asset dependency overrides. */
  carDependencies?: CarAssetsScopeDependencies;

  /** Optional series-asset dependency overrides. */
  seriesDependencies?: SeriesAssetsScopeDependencies;

  /** Optional track-asset dependency overrides. */
  trackDependencies?: TrackAssetsScopeDependencies;
}

/**
 * Build the structural assets command group and register its executable leaves.
 * The parent owns no invocation scope; each leaf resolves its own dependencies.
 * @param {CreateAssetsCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {CarAssetsScopeDependencies | undefined} root0.carDependencies - Optional dependency overrides for car assets.
 * @param {SeriesAssetsScopeDependencies | undefined} root0.seriesDependencies - Optional dependency overrides for series assets.
 * @param {TrackAssetsScopeDependencies | undefined} root0.trackDependencies - Optional dependency overrides for track assets.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createAssetsCommand({
  diagnostics,
  carDependencies,
  seriesDependencies,
  trackDependencies,
}: CreateAssetsCommandOptions) {
  const assets = new Command("assets").description(
    "Data API asset metadata commands",
  );

  assets.addCommand(
    createCarAssetsCommand({ diagnostics, dependencies: carDependencies }),
  );
  assets.addCommand(
    createSeriesAssetsCommand({
      diagnostics,
      dependencies: seriesDependencies,
    }),
  );
  assets.addCommand(
    createTrackAssetsCommand({
      diagnostics,
      dependencies: trackDependencies,
    }),
  );

  return assets;
}
