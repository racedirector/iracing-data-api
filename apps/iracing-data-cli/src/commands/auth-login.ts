import { Command } from "@commander-js/extra-typings";
import type { Diagnostics } from "../diagnostics.js";

export function createAuthLoginCommand(diagnostics: Diagnostics) {
  return new Command("login")
    .description("Authenticate with iRacing using browser OAuth")
    .option("-o, --output <path>", "Write the token response to a file")
    .option("--format <json|yaml>", "Token serialization format")
    .option("--force", "Replace an existing output file")
    .option("--no-open", "Do not open the browser automatically")
    .option(
      "--timeout-seconds <seconds>",
      "OAuth callback timeout in seconds",
      "300",
    )
    .action(async () => {
      diagnostics.error("Browser OAuth login is not implemented yet.");
      process.exitCode = 1;
    });
}
