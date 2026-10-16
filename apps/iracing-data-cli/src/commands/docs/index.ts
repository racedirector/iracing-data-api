import {
  createDocsCommand as createCommand,
  type DocsCommandDependencies,
} from "./command.js";
import {
  createDocsCommandScopeFactory,
  type DocsScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../diagnostics.js";

/**
 * Composition inputs used to bind the docs command to shared diagnostics and scope
 * dependencies.
 */
export interface CreateDocsCommandOptions {
  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;

  /** Optional overrides for command-scoped external capabilities. */
  dependencies?: DocsScopeDependencies;
}

/**
 * Public registration boundary for the docs command module.
 *
 * Consumers register one command and do not need to know that command execution uses
 * a separately composed invocation scope. Injectable scope dependencies are exposed
 * here for tests and future application composition while production registrations
 * can use the module defaults.
 * @param {CreateDocsCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {DocsScopeDependencies | undefined} root0.dependencies - Injected external capabilities used by the command scope.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createDocsCommand({
  diagnostics,
  dependencies,
}: CreateDocsCommandOptions) {
  const commandDependencies: DocsCommandDependencies = {
    createScope: createDocsCommandScopeFactory(diagnostics, dependencies),
  };

  return createCommand(commandDependencies);
}

export type { DocsScopeDependencies } from "./scope.js";
