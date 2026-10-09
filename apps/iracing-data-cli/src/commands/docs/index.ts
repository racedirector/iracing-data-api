import type { Diagnostics } from "../../diagnostics.js";
import {
  createDocsCommand as createCommand,
  type DocsCommandDependencies,
} from "./command.js";
import { createDocsCommandScopeFactory } from "./scope.js";

export interface CreateDocsCommandOptions {
  diagnostics: Diagnostics;
}

/**
 * Public registration boundary for the docs command.
 *
 * Consumers register the command as a module and do not need to know that its
 * invocation scope is composed separately. The module owns that wiring so a future
 * DI container can replace the scope mechanics without changing registration sites.
 */
export function createDocsCommand({ diagnostics }: CreateDocsCommandOptions) {
  const dependencies: DocsCommandDependencies = {
    createScope: createDocsCommandScopeFactory(diagnostics),
  };

  return createCommand(dependencies);
}
