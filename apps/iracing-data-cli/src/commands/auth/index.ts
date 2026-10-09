import { Command } from "@commander-js/extra-typings";
import { createLoginCommand } from "./login/index.js";
import type { Diagnostics } from "../../diagnostics.js";

interface CreateAuthCommandOptions {
  diagnostics: Diagnostics;
}

export function createAuthCommand({ diagnostics }: CreateAuthCommandOptions) {
  const auth = new Command("auth").description("Authentication commands");
  auth.addCommand(createLoginCommand({ diagnostics }));
  return auth;
}
