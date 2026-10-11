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
  diagnostics: Diagnostics;
  dependencies?: TrackAssetsScopeDependencies;
}

/**
 * Public registration boundary for `iracing-data assets track`.
 * Production callers use defaults while tests may inject command-scoped seams.
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
