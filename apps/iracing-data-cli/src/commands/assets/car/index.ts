import {
  createCarAssetsCommand as createCommand,
  type CarAssetsCommandDependencies,
} from "./command.js";
import {
  createCarAssetsCommandScopeFactory,
  type CarAssetsScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Composition inputs used to bind the car-assets leaf command. */
export interface CreateCarAssetsCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: CarAssetsScopeDependencies;
}

/**
 * Public registration boundary for `iracing-data assets car`.
 * Production callers use defaults while tests may inject the command-scoped seams.
 */
export function createCarAssetsCommand({
  diagnostics,
  dependencies,
}: CreateCarAssetsCommandOptions) {
  const commandDependencies: CarAssetsCommandDependencies = {
    createScope: createCarAssetsCommandScopeFactory(diagnostics, dependencies),
  };

  return createCommand(commandDependencies);
}

export type { CarAssetsScopeDependencies } from "./scope.js";
