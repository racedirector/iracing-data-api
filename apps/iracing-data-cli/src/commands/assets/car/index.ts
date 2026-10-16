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
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional overrides for command-scoped external capabilities. */
  dependencies?: CarAssetsScopeDependencies;
}

/**
 * Public registration boundary for `iracing-data assets car`.
 * Production callers use defaults while tests may inject the command-scoped seams.
 * @param {CreateCarAssetsCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {CarAssetsScopeDependencies | undefined} root0.dependencies - Injected external capabilities used by the command scope.
 * @returns {Command} Configured CLI command ready for registration.
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
