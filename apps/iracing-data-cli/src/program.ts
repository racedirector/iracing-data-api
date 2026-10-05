import { Command } from "@commander-js/extra-typings";
import { createAuthLoginCommand } from "./commands/auth-login.js";
import { createDocsCommand } from "./commands/docs.js";
import { createWhoamiCommand } from "./commands/whoami.js";
import type { Diagnostics } from "./diagnostics.js";

export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  const auth = new Command("auth").description("Authentication commands");
  auth.addCommand(createAuthLoginCommand(diagnostics));
  program.addCommand(auth);
  program.addCommand(createDocsCommand(diagnostics));
  program.addCommand(createWhoamiCommand(diagnostics));

  return program;
}
