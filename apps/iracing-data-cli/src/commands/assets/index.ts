/** Structural assets command group. Leaf services own their API operations. */
import { Command } from "@commander-js/extra-typings";
import { createCarAssetsCommand, type CarAssetsService } from "./car/index.js";
import {
  createSeriesAssetsCommand,
  type SeriesAssetsService,
} from "./series/index.js";
import {
  createTrackAssetsCommand,
  type TrackAssetsScopeDependencies,
} from "./track/index.js";
import type { Diagnostics } from "../../diagnostics.js";

/** Transitional registration contract while track remains on its old scope. */
export interface CreateAssetsCommandOptions {
  /** Already-composed car service. */
  carService: CarAssetsService;

  /** Already-composed series service. */
  seriesService: SeriesAssetsService;

  /** Still required by the old track-assets implementation. */
  diagnostics: Diagnostics;

  /** Legacy track dependencies until PR C. */
  trackDependencies?: TrackAssetsScopeDependencies;
}

/**
 * Group independently registered leaves without external effects.
 * @param {CreateAssetsCommandOptions} root0 - Services and transitional track wiring.
 * @param {CarAssetsService} root0.carService - Migrated car service.
 * @param {SeriesAssetsService} root0.seriesService - Migrated series service.
 * @param {Diagnostics} root0.diagnostics - Legacy track diagnostics.
 * @param {TrackAssetsScopeDependencies} root0.trackDependencies - Legacy track I/O.
 * @returns {Command} Structural assets command.
 */
export function createAssetsCommand({
  carService,
  seriesService,
  diagnostics,
  trackDependencies,
}: CreateAssetsCommandOptions) {
  const assets = new Command("assets").description(
    "Data API asset metadata commands",
  );

  assets.addCommand(createCarAssetsCommand(carService));
  assets.addCommand(createSeriesAssetsCommand(seriesService));
  assets.addCommand(
    createTrackAssetsCommand({
      diagnostics,
      dependencies: trackDependencies,
    }),
  );

  return assets;
}
