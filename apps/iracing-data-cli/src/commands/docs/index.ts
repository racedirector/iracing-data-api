import type { Diagnostics } from "../../diagnostics.js";
import {
  createDocsCommand as createCommand,
  type DocsCommandDependencies,
} from "./command.js";
import {
  createDocsCommandScopeFactory,
  type DocsScopeDependencies,
} from "./scope.js";

export interface CreateDocsCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: DocsScopeDependencies;
}

/**
 * Public registration boundary for the docs command module.
 *
 * Consumers register one command and do not need to know that command execution uses
 * a separately composed invocation scope. Injectable scope dependencies are exposed
 * here for tests and future application composition while production registrations
 * can use the module defaults.
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
