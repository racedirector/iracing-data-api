import {
  createLoginCommand as createCommand,
  type LoginCommandDependencies,
} from "./command.js";
import {
  createLoginCommandScopeFactory,
  type LoginScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../../diagnostics.js";

/**
 * Composition inputs used to bind the login command to shared diagnostics and its
 * per-invocation dependencies.
 */
export interface CreateLoginCommandOptions {
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional overrides for command-scoped external capabilities. */
  dependencies?: LoginScopeDependencies;
}

/**
 * Build a login command with browser/password-limited OAuth, process environment, secret input,
 * and token-file persistence defaults, or supplied dependencies. I/O begins when its action runs.
 * @param {CreateLoginCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {LoginScopeDependencies | undefined} root0.dependencies - Injected external capabilities used by the command scope.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createLoginCommand({
  diagnostics,
  dependencies,
}: CreateLoginCommandOptions) {
  const commandDependencies: LoginCommandDependencies = {
    createScope: createLoginCommandScopeFactory(diagnostics, dependencies),
  };

  return createCommand(commandDependencies);
}

export type { LoginScopeDependencies } from "./scope.js";
