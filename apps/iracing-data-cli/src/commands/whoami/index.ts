import {
  createWhoamiCommand as createCommand,
  type WhoamiCommandDependencies,
} from "./command.js";
import {
  createWhoamiCommandScopeFactory,
  type WhoamiScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../diagnostics.js";

export interface CreateWhoamiCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: WhoamiScopeDependencies;
}

/**
 * Build a whoami command with credential resolution, Fetch, and stdout defaults,
 * or supplied dependencies. I/O begins when its action runs.
 */
export function createWhoamiCommand({
  diagnostics,
  dependencies,
}: CreateWhoamiCommandOptions) {
  const commandDependencies: WhoamiCommandDependencies = {
    createScope: createWhoamiCommandScopeFactory(diagnostics, dependencies),
  };

  return createCommand(commandDependencies);
}

export type { WhoamiScopeDependencies } from "./scope.js";
