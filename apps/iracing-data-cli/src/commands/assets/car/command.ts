/** Commander adapter for the car-assets command. */
import { Command } from "@commander-js/extra-typings";
import { OptionsSchema } from "./schema.js";
import type { CarAssetsService } from "./service.js";

/**
 * Register without invoking the service or any external I/O.
 * @param {CarAssetsService} service - Opinionated car-assets execution.
 * @returns {Command} Configured car-assets command.
 */
export function createCarAssetsCommand(service: CarAssetsService) {
  return new Command("car")
    .description("Fetch and materialize Data API car asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action((options) => service.execute(OptionsSchema.parse(options)));
}
