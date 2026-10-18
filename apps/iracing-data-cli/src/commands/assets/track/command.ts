/** Thin Commander adapter for the track-assets service. */
import { Command } from "@commander-js/extra-typings";
import { OptionsSchema } from "./schema.js";
import type { TrackAssetsService } from "./service.js";

/**
 * Register without credential, network, or output effects.
 * @param {TrackAssetsService} service - Opinionated track-assets execution.
 * @returns {Command} Configured track-assets command.
 */
export function createTrackAssetsCommand(service: TrackAssetsService) {
  return new Command("track")
    .description("Fetch and materialize Data API track asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action((options) => service.execute(OptionsSchema.parse(options)));
}
