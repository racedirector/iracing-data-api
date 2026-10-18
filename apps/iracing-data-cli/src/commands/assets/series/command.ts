/** Thin Commander adapter for the series-assets service. */
import { Command } from "@commander-js/extra-typings";
import { OptionsSchema } from "./schema.js";
import type { SeriesAssetsService } from "./service.js";

/**
 * Register without credential, network, or output effects.
 * @param {SeriesAssetsService} service - Opinionated series-assets execution.
 * @returns {Command} Configured series-assets command.
 */
export function createSeriesAssetsCommand(service: SeriesAssetsService) {
  return new Command("series")
    .description("Fetch and materialize Data API series asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action((options) => service.execute(OptionsSchema.parse(options)));
}
