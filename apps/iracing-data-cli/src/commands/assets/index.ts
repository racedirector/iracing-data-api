/** Structural assets command group. Leaf services own their API operations. */
import { Command } from "@commander-js/extra-typings";
import {
  createCarAssetsCommand,
  type CarAssetsService,
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

export interface CreateAssetsCommandOptions {
  /** Already-composed service for the migrated car command. */
  carService: CarAssetsService;
  /** Still needed by the series and track commands until their stack layers. */
  diagnostics: Diagnostics;
  seriesDependencies?: SeriesAssetsScopeDependencies;
  trackDependencies?: TrackAssetsScopeDependencies;
}

/** Group independently registered leaves without executing external effects. */
export function createAssetsCommand({
  carService,
  diagnostics,
  seriesDependencies,
  trackDependencies,
}: CreateAssetsCommandOptions) {
  const assets = new Command("assets").description(
    "Data API asset metadata commands",
  );

  assets.addCommand(createCarAssetsCommand(carService));
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
