import {
  createWhoamiCommand as createCommand,
  type WhoamiCommandDependencies,
} from "./command.js";
import {
  createWhoamiCommandScopeFactory,
  type WhoamiScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../diagnostics.js";

/**
 * Composition inputs used to bind the whoami command to shared diagnostics and scope
 * dependencies.
 */
export interface CreateWhoamiCommandOptions {
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional overrides for command-scoped external capabilities. */
  dependencies?: WhoamiScopeDependencies;
}

/**
 * Build a whoami command with credential resolution, OAuth API, and stdout defaults,
 * or supplied dependencies. I/O begins when its action runs.
 * @param {CreateWhoamiCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {WhoamiScopeDependencies | undefined} root0.dependencies - Injected external capabilities used by the command scope.
 * @returns {Command} Configured CLI command ready for registration.
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
