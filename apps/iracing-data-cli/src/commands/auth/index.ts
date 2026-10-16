import { Command } from "@commander-js/extra-typings";
import { createLoginCommand } from "./login/index.js";
import type { Diagnostics } from "../../diagnostics.js";

interface CreateAuthCommandOptions {
  diagnostics: Diagnostics;
}

/**
 * Builds the authentication command group from its leaf command modules while propagating the
 * shared diagnostics sink.
 * @param {CreateAuthCommandOptions} root0 - Command composition inputs and dependency overrides.
 * @param {Diagnostics} root0.diagnostics - Secret-safe sink for command progress and failure messages.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createAuthCommand({ diagnostics }: CreateAuthCommandOptions) {
  const auth = new Command("auth").description("Authentication commands");

  auth.addCommand(createLoginCommand({ diagnostics }));

  return auth;
}
