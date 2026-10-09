import { Command } from "@commander-js/extra-typings";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand } from "./commands/docs/index.js";
import { createWhoamiCommand } from "./commands/whoami.js";
import type { Diagnostics } from "./diagnostics.js";

export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(createDocsCommand({ diagnostics }));
  program.addCommand(createWhoamiCommand(diagnostics));

  return program;
}
