import { Command } from "@commander-js/extra-typings";
import { authenticateWithBrowser } from "../authenticate.js";
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
    .action(async (options) => {
      const timeoutSeconds = Number(options.timeoutSeconds);
      await authenticateWithBrowser({
        clientId: process.env.IRACING_AUTH_CLIENT ?? "",
        clientSecret: process.env.IRACING_AUTH_SECRET || undefined,
        timeoutSeconds,
        openBrowser: options.open,
        diagnostics,
      });
      diagnostics.info("OAuth authentication complete.");
    });
}
