import {
  createSeriesAssetsCommand as createCommand,
  type SeriesAssetsCommandDependencies,
} from "./command.js";
import {
  createSeriesAssetsCommandScopeFactory,
  type SeriesAssetsScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Composition inputs used to bind the series-assets leaf command. */
export interface CreateSeriesAssetsCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: SeriesAssetsScopeDependencies;
}

/**
 * Public registration boundary for `iracing-data assets series`.
 * Production callers use defaults while tests may inject command-scoped seams.
 */
export function createSeriesAssetsCommand({
  diagnostics,
  dependencies,
}: CreateSeriesAssetsCommandOptions) {
  const commandDependencies: SeriesAssetsCommandDependencies = {
    createScope: createSeriesAssetsCommandScopeFactory(
      diagnostics,
      dependencies,
    ),
  };

  return createCommand(commandDependencies);
}

export type { SeriesAssetsScopeDependencies } from "./scope.js";
