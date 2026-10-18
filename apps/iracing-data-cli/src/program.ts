import { Command } from "@commander-js/extra-typings";
import { createAssetsCommand } from "./commands/assets/index.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand } from "./commands/docs.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import type { Diagnostics } from "./diagnostics.js";

/**
 * Build the CLI with assets, auth, docs, and whoami commands, ready for argument parsing.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failure messages.
 * @returns {Command} Configured root CLI command and its subcommands.
 */
export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  program.addCommand(createAssetsCommand({ diagnostics }));
  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(createDocsCommand({ diagnostics }));
  program.addCommand(createWhoamiCommand({ diagnostics }));

  return program;
}
