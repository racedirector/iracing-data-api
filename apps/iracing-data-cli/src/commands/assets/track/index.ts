import {
  createTrackAssetsCommand as createCommand,
  type TrackAssetsCommandDependencies,
} from "./command.js";
import {
  createTrackAssetsCommandScopeFactory,
  type TrackAssetsScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Composition inputs used to bind the track-assets leaf command. */
export interface CreateTrackAssetsCommandOptions {
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional overrides for command-scoped external capabilities. */
  dependencies?: TrackAssetsScopeDependencies;
}

/**
 * Public registration boundary for `iracing-data assets track`.
 * Production callers use defaults while tests may inject command-scoped seams.
 * @param {CreateTrackAssetsCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {TrackAssetsScopeDependencies | undefined} root0.dependencies - Injected external capabilities used by the command scope.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createTrackAssetsCommand({
  diagnostics,
  dependencies,
}: CreateTrackAssetsCommandOptions) {
  const commandDependencies: TrackAssetsCommandDependencies = {
    createScope: createTrackAssetsCommandScopeFactory(
      diagnostics,
      dependencies,
    ),
  };

  return createCommand(commandDependencies);
}

export type { TrackAssetsScopeDependencies } from "./scope.js";
