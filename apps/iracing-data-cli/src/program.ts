import { Command, Option } from "@commander-js/extra-typings";
import { createActivityCommands } from "./commands/activity/command.js";
import { createActivityService } from "./commands/activity/service.js";
import { createAssetsCommand } from "./commands/assets/command.js";
import { createAssetsService } from "./commands/assets/service.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { createConstantsCommand } from "./commands/constants/command.js";
import { createConstantsService } from "./commands/constants/service.js";
import { createDocsCommand } from "./commands/docs/command.js";
import { createDocsService } from "./commands/docs/service.js";
import { createHostedCommand } from "./commands/hosted/command.js";
import { createHostedService } from "./commands/hosted/service.js";
import { createImportCommands } from "./commands/import-data/command.js";
import { createImportService } from "./commands/import-data/service.js";
import { createLeagueCommand } from "./commands/league/command.js";
import { createLeagueService } from "./commands/league/service.js";
import { createLookupCommand } from "./commands/lookup/command.js";
import { createLookupService } from "./commands/lookup/service.js";
import { createReferenceCommands } from "./commands/reference/command.js";
import { createReferenceService } from "./commands/reference/service.js";
import { createResultsCommand } from "./commands/results/command.js";
import { createResultsService } from "./commands/results/service.js";
import { createStatsCommand } from "./commands/stats/command.js";
import { createStatsService } from "./commands/stats/service.js";
import { createTeamCommand } from "./commands/team/command.js";
import { createTeamService } from "./commands/team/service.js";
import { createWhoamiCommand } from "./commands/whoami/command.js";
import { createWhoamiService } from "./commands/whoami/service.js";
import { writeDocumentOutput } from "./token-output.js";
import type { Diagnostics, DisplayWriter } from "./types.js";

/** Host dependencies for CLI composition. */
export interface CreateProgramOptions {
  /** Secret-safe progress and error output. */
  diagnostics: Diagnostics;

  /** HTTP transport for API requests and cache downloads. */
  fetch: typeof fetch;

  /** Host-configured JSON-only stdout display writer. */
  display: DisplayWriter;
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
    .addCommand(
      createStatsCommand(
        createStatsService({ fetch: options.fetch, ...options.display }),
      ),
    )
    .addCommand(
      createLookupCommand(
        createLookupService({ fetch: options.fetch, ...options.display }),
      ),
    )
    .addCommand(
      createConstantsCommand(
        createConstantsService({ fetch: options.fetch, ...options.display }),
      ),
    )
    .addCommand(
      createHostedCommand(
        createHostedService({ fetch: options.fetch, ...options.display }),
      ),
    )
    .addCommand(
      createTeamCommand(
        createTeamService({ fetch: options.fetch, ...options.display }),
      ),
    )
    .addCommand(
      createAssetsCommand(
        createAssetsService({
          fetch: options.fetch,
          ...options.display,
        }),
      ),
    )
    .addCommand(createAuthCommand(options))
    .addCommand(
      createDocsCommand(
        createDocsService({
          fetch: options.fetch,
          diagnostics: options.diagnostics,
          writeDocumentOutput,
        }),
      ),
    )
    .addCommand(
      createWhoamiCommand(
        createWhoamiService({
          ...options,
          ...options.display,
        }),
      ),
    )
    .addCommand(
      createLeagueCommand(
        createLeagueService({
          fetch: options.fetch,
          ...options.display,
        }),
      ),
    )
    .addCommand(
      createResultsCommand(
        createResultsService({
          fetch: options.fetch,
          ...options.display,
        }),
      ),
    );

  for (const command of createActivityCommands(
    createActivityService({ fetch: options.fetch, ...options.display }),
  )) {
    program.addCommand(command);
  }

  for (const command of createReferenceCommands(
    createReferenceService({ fetch: options.fetch, ...options.display }),
  )) {
    program.addCommand(command);
  }

  for (const command of createImportCommands(
    createImportService({ fetch: options.fetch, ...options.display }),
  )) {
    program.addCommand(command);
  }

  return program;
}
