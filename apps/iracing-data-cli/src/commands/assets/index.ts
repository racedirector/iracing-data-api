/** Structural assets command group. Leaf services own their API operations. */
import { Command } from "@commander-js/extra-typings";
import { createCarAssetsCommand, type CarAssetsService } from "./car/index.js";
import {
  createSeriesAssetsCommand,
  type SeriesAssetsScopeDependencies,
} from "./series/index.js";
import {
  createTrackAssetsCommand,
  type TrackAssetsScopeDependencies,
} from "./track/index.js";
import type { Diagnostics } from "../../diagnostics.js";

/** Service composition during the car-only migration phase. */
export interface CreateAssetsCommandOptions {
  /** Already-composed service for the migrated car command. */
  carService: CarAssetsService;

  /** Still needed by the series and track commands until their stack layers. */
  diagnostics: Diagnostics;

  /** Legacy series injection until PR B. */
  seriesDependencies?: SeriesAssetsScopeDependencies;

  /** Legacy track injection until PR C. */
  trackDependencies?: TrackAssetsScopeDependencies;
}

/**
 * Group independently registered leaves without executing external effects.
 * @param {CreateAssetsCommandOptions} root0 - Leaf service and transitional scopes.
 * @param {CarAssetsService} root0.carService - Migrated car service.
 * @param {Diagnostics} root0.diagnostics - Legacy leaf diagnostics.
 * @param {SeriesAssetsScopeDependencies} root0.seriesDependencies - Legacy series I/O.
 * @param {TrackAssetsScopeDependencies} root0.trackDependencies - Legacy track I/O.
 * @returns {Command} Structural assets command.
 */
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
