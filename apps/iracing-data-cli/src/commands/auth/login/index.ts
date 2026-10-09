import {
  createLoginCommand as createCommand,
  type LoginCommandDependencies,
} from "./command.js";
import {
  createLoginCommandScopeFactory,
  type LoginScopeDependencies,
} from "./scope.js";
import type { Diagnostics } from "../../../diagnostics.js";

export interface CreateLoginCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: LoginScopeDependencies;
}

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
