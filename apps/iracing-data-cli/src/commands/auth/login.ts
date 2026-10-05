import { Command } from "@commander-js/extra-typings";
import { authenticateWithBrowser } from "../../authenticate.js";
import { defaultCredentialsPath } from "../../credentials.js";
import { Diagnostics } from "../../diagnostics.js";
import { resolveTokenFormat, writeTokenOutput } from "../../token-output.js";

interface CreateLoginCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: {
    authenticate: typeof authenticateWithBrowser;
    writeOutput: typeof writeTokenOutput;
  };
}

export function createLoginCommand({
  diagnostics,
  dependencies = {
    authenticate: authenticateWithBrowser,
    writeOutput: writeTokenOutput,
  },
}: CreateLoginCommandOptions) {
  return new Command("login")
    .description("Authenticate with iRacing using browser OAuth")
    .option(
      "-o, --output <path>",
      "Write tokens to an alternate file (protected unless --force)",
    )
    .option(
      "--credentials <path>",
      "Credential file to update instead of the repository default",
    )
    .option("--format <json|yaml>", "Token serialization format")
    .option("--force", "Replace an existing output file")
    .option("--no-open", "Do not open the browser automatically")
    .option(
      "--timeout-seconds <seconds>",
      "OAuth callback timeout in seconds",
      "300",
    )
    .action(async (options) => {
      if (options.output && options.credentials)
        throw new Error("Use either --output or --credentials, not both.");
      const destination =
        options.output ?? options.credentials ?? defaultCredentialsPath;
      resolveTokenFormat(destination, options.format);
      if (!options.output && !options.credentials && options.format === "yaml")
        throw new Error(
          "The shared credential file uses JSON. Pass --credentials with a .yaml path for YAML output.",
        );
      const token = await dependencies.authenticate({
        clientId: process.env.IRACING_AUTH_CLIENT ?? "",
        clientSecret: process.env.IRACING_AUTH_SECRET || undefined,
        redirectUri: process.env.IRACING_AUTH_REDIRECT_URI || undefined,
        timeoutSeconds: Number(options.timeoutSeconds),
        openBrowser: options.open,
        diagnostics,
      });

      await dependencies.writeOutput(token, {
        output: destination,
        format: options.format,
        force: options.force ?? !options.output,
      });
      diagnostics.info(
        `OAuth authentication complete. Credentials updated: ${destination}`,
      );
    });
}
