import { Command } from "@commander-js/extra-typings";
import {
  OAuthScopeListCodec,
  type OAuthScopeList,
} from "@iracing-data/oauth-client";
import { authenticateWithBrowser, DEFAULT_SCOPES } from "../../authenticate.js";
import {
  defaultCredentialsPath,
  defaultMcpCredentialsPath,
} from "../../credentials.js";
import { Diagnostics } from "../../diagnostics.js";
import { resolveTokenFormat, writeTokenOutput } from "../../token-output.js";

interface CreateLoginCommandOptions {
  diagnostics: Diagnostics;
  dependencies?: {
    authenticate: typeof authenticateWithBrowser;
    writeOutput: typeof writeTokenOutput;
  };
}

const INVALID_SCOPE_MESSAGE =
  "--scope must be either 'iracing.auth' or 'iracing.auth iracing.profile'.";

function resolveScopes(values: string[] | undefined): OAuthScopeList {
  if (!values) return DEFAULT_SCOPES;

  const parsed = OAuthScopeListCodec.safeParse(values.join(" "));
  if (!parsed.success) throw new Error(INVALID_SCOPE_MESSAGE);

  const scopes = parsed.data;
  const authOnly = scopes.length === 1 && scopes[0] === "iracing.auth";
  const authAndProfile =
    scopes.length === 2 &&
    scopes[0] === "iracing.auth" &&
    scopes[1] === "iracing.profile";

  if (!authOnly && !authAndProfile) {
    throw new Error(INVALID_SCOPE_MESSAGE);
  }

  return scopes;
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
    .option(
      "--scope <scopes...>",
      "OAuth scopes: iracing.auth, or iracing.auth iracing.profile",
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

      const scopes = resolveScopes(options.scope);
      const authOnly = scopes.length === 1;
      const destination =
        options.output ??
        options.credentials ??
        (authOnly ? defaultMcpCredentialsPath : defaultCredentialsPath);

      resolveTokenFormat(destination, options.format);
      if (!options.output && !options.credentials && options.format === "yaml")
        throw new Error(
          "The shared credential file uses JSON. Pass --credentials with a .yaml path for YAML output.",
        );
      const token = await dependencies.authenticate({
        clientId: process.env.IRACING_AUTH_CLIENT ?? "",
        clientSecret: process.env.IRACING_AUTH_SECRET || undefined,
        redirectUri: process.env.IRACING_AUTH_REDIRECT_URI || undefined,
        scopes,
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
