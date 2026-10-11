import { Command } from "@commander-js/extra-typings";
import {
  createCarAssetsCommand,
  type CarAssetsScopeDependencies,
} from "./car/index.js";
import {
  createSeriesAssetsCommand,
  type SeriesAssetsScopeDependencies,
} from "./series/index.js";
import type { Diagnostics } from "../../diagnostics.js";

/** Composition inputs for the structural assets command group. */
export interface CreateAssetsCommandOptions {
  diagnostics: Diagnostics;
  carDependencies?: CarAssetsScopeDependencies;
  seriesDependencies?: SeriesAssetsScopeDependencies;
}

/**
 * Build the structural assets command group and register its executable leaves.
 * The parent owns no invocation scope; each leaf resolves its own dependencies.
 */
export function createAssetsCommand({
  diagnostics,
  carDependencies,
  seriesDependencies,
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
  return assets;
}
