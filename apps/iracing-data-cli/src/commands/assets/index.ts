/** Structural assets command group. Leaf services own their API operations. */
import { Command } from "@commander-js/extra-typings";
import { createCarAssetsCommand, type CarAssetsService } from "./car/index.js";
import {
  createSeriesAssetsCommand,
  type SeriesAssetsService,
} from "./series/index.js";
import {
  createTrackAssetsCommand,
  type TrackAssetsService,
} from "./track/index.js";

/** Independently composed leaf services required by the assets command group. */
export interface CreateAssetsCommandOptions {
  /** Opinionated car-assets service. */
  carService: CarAssetsService;

  /** Opinionated series-assets service. */
  seriesService: SeriesAssetsService;

  /** Opinionated track-assets service. */
  trackService: TrackAssetsService;
}

/**
 * Group independently registered leaves without external effects.
 * @param {CreateAssetsCommandOptions} root0 - Already-composed leaf services.
 * @param {CarAssetsService} root0.carService - Car-assets service.
 * @param {SeriesAssetsService} root0.seriesService - Series-assets service.
 * @param {TrackAssetsService} root0.trackService - Track-assets service.
 * @returns {Command} Structural assets command.
 */
export function createAssetsCommand({
  carService,
  seriesService,
  trackService,
}: CreateAssetsCommandOptions) {
  const assets = new Command("assets").description(
    "Data API asset metadata commands",
  );

  assets.addCommand(createCarAssetsCommand(carService));
  assets.addCommand(createSeriesAssetsCommand(seriesService));
  assets.addCommand(createTrackAssetsCommand(trackService));

  return assets;
}
