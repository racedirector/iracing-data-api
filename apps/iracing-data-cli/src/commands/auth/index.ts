import { Command } from "@commander-js/extra-typings";
import { Diagnostics } from "../../diagnostics.js";
import { createLoginCommand } from "./login.js";

interface CreateAuthCommandOptions {
  diagnostics: Diagnostics;
}

export function createAuthCommand({ diagnostics }: CreateAuthCommandOptions) {
  const auth = new Command("auth").description("Authentication commands");

  auth.addCommand(createLoginCommand({ diagnostics }));

  return auth;
}
