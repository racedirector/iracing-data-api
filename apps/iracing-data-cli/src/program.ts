import { Command } from "@commander-js/extra-typings";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand } from "./commands/docs/index.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import type { Diagnostics } from "./diagnostics.js";

/** Build the CLI with auth, docs, and whoami commands, ready for argument parsing. */
export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(createDocsCommand({ diagnostics }));
  program.addCommand(createWhoamiCommand({ diagnostics }));

  return program;
}
