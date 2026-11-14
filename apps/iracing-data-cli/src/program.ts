import { Command, Option } from "@commander-js/extra-typings";
import { createAssetsCommand } from "./commands/assets/index.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand } from "./commands/docs/index.js";
import { createLeagueHistoryCommand } from "./commands/league-history/command.js";
import { createResultsCommand } from "./commands/results/command.js";
import { createResultsService } from "./commands/results/service.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import { createHistoryService } from "./league-history-adapters.js";
import type { Diagnostics } from "./diagnostics.js";

/** Host dependencies for CLI composition. */
export interface CreateProgramOptions {
  /** Secret-safe progress and error output. */
  diagnostics: Diagnostics;

  /** HTTP transport for API requests and cache downloads. */
  fetch: typeof fetch;
}

/**
 * Build the CLI with authentication, metadata, results and history commands.
 * @param {CreateProgramOptions} options - Host diagnostics and HTTP transport.
 * @returns {Command} Configured root CLI command and its subcommands.
 */
// eslint-disable-next-line max-lines-per-function -- Keep root options and command registration together at the composition root.
export function createProgram(options: CreateProgramOptions) {
  const program = new Command("iracing-data")
    .description("Repository CLI for iRacing user workflows")
    .addOption(
      new Option("--access-token <token>")
        .env("IRACING_ACCESS_TOKEN")
        .hideHelp(),
    )
    .addOption(
      new Option(
        "--credentials <path>",
        "Credential document (IRACING_CREDENTIALS)",
      ).env("IRACING_CREDENTIALS"),
    )
    .addOption(
      new Option("--client-id <id>").env("IRACING_AUTH_CLIENT").hideHelp(),
    )
    .addOption(
      new Option("--client-secret <secret>")
        .env("IRACING_AUTH_SECRET")
        .hideHelp(),
    )
    .addOption(
      new Option("--redirect-uri <uri>")
        .env("IRACING_AUTH_REDIRECT_URI")
        .hideHelp(),
    )
    .addOption(
      new Option("--username <username>")
        .env("IRACING_AUTH_USERNAME")
        .hideHelp(),
    )
    .addOption(
      new Option("--password <password>")
        .env("IRACING_AUTH_PASSWORD")
        .hideHelp(),
    );

  program
    .addCommand(createAssetsCommand(options))
    .addCommand(createAuthCommand(options))
    .addCommand(createDocsCommand(options))
    .addCommand(createWhoamiCommand(options))
    .addCommand(
      createResultsCommand(
        createResultsService({
          fetch: options.fetch,
          display: (document) =>
            process.stdout.write(`${JSON.stringify(document, null, 2)}\n`),
        }),
      ),
    );
  program.addCommand(
    createLeagueHistoryCommand(
      createHistoryService({
        fetch: options.fetch,
        environment: process.env,
        now: () => new Date(),
        display: (document) =>
          process.stdout.write(`${JSON.stringify(document, null, 2)}\n`),
      }),
    ),
  );

  return program;
}
