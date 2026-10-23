import { Command } from "@commander-js/extra-typings";
import { createLoginCommand } from "./login/index.js";
import type { Diagnostics } from "../../diagnostics.js";

/**
 * Command composition inputs and dependency overrides.
 */
interface CreateAuthCommandOptions {
  /** Secret-safe sink for command progress and failure messages. */
  diagnostics: Diagnostics;
}

/**
 * Builds the authentication command group from its leaf command modules while propagating the
 * shared diagnostics sink.
 *
 * @param {CreateAuthCommandOptions} options - The options for command.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createAuthCommand({
  diagnostics,
}: CreateAuthCommandOptions): Command {
  return new Command("auth")
    .description("Authentication commands")
    .addCommand(createLoginCommand({ diagnostics }));
}
