import { Command } from "@commander-js/extra-typings";
import { createAuthLoginCommand } from "./commands/auth-login.js";
import type { Diagnostics } from "./diagnostics.js";

export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  const auth = new Command("auth").description("Authentication commands");
  auth.addCommand(createAuthLoginCommand(diagnostics));
  program.addCommand(auth);

  return program;
}
