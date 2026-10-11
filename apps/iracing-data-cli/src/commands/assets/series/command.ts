import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Credential options accepted by the series-assets command. */
export type SeriesAssetsOptions = CredentialOptions;

/** Per-invocation capabilities required by the series-assets command handler. */
export interface SeriesAssetsCommandScope {
  assets: {
    get(): Promise<unknown>;
  };
  output: {
    write(payload: unknown): void;
  };
  diagnostics: Diagnostics;
}

/** Factory contract for one isolated series-assets invocation scope. */
export type CreateSeriesAssetsCommandScope = (
  options: SeriesAssetsOptions,
) => Promise<SeriesAssetsCommandScope>;

/** Application-registration dependencies for the series-assets command. */
export interface SeriesAssetsCommandDependencies {
  createScope: CreateSeriesAssetsCommandScope;
}

/** Build `iracing-data assets series` around one command-scoped dependency resolution. */
export function createSeriesAssetsCommand({
  createScope,
}: SeriesAssetsCommandDependencies) {
  return new Command("series")
    .description("Fetch and materialize Data API series asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action(async (options) => {
      const { assets, output, diagnostics } = await createScope(options);
      const payload = await assets.get();
      output.write(payload);
      diagnostics.info("Series assets fetched.");
    });
}
