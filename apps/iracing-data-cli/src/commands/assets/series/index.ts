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
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional overrides for command-scoped external capabilities. */
  dependencies?: SeriesAssetsScopeDependencies;
}

/**
 * Public registration boundary for `iracing-data assets series`.
 * Production callers use defaults while tests may inject command-scoped seams.
 * @param {CreateSeriesAssetsCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {SeriesAssetsScopeDependencies | undefined} root0.dependencies - Injected external capabilities used by the command scope.
 * @returns {Command} Configured CLI command ready for registration.
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
