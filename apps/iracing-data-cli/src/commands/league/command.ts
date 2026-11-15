import { Command } from "@commander-js/extra-typings";
import { readCredentialOptions } from "../../schema.js";
import { LeagueRequestSchema } from "./contracts.js";
import type { LeagueOptions, LeagueRequest } from "./contracts.js";

/** Host-owned league retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch the selected league document.
   * @param {LeagueOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Downloaded JSON.
   */
  fetchLeague(options: LeagueOptions): Promise<unknown>;

  /**
   * Display the downloaded document.
   * @param {unknown} document - Downloaded JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind league retrieval to presentation without owning I/O.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: LeagueOptions) => {
    service.present(await service.fetchLeague(options));
  };
}

/**
 * Build the league command group over canonical request schemas.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} League group with JSON-producing API commands.
 */
export function createLeagueCommand(service: CreateExecuteOptions) {
  const group = new Command("league").description(
    "Fetch league API documents as JSON",
  );

  const execute = createExecute(service);

  for (const command of leagueCommands()) {
    command.action(async (raw: Record<string, unknown>, leaf: Command) => {
      const query = Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [
          key.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
          value,
        ]),
      );

      const request = LeagueRequestSchema.parse({
        operation: command.name(),
        query,
      });

      await execute({ request, ...readCredentialOptions(leaf) });
    });
    group.addCommand(command);
  }

  return group;
}

/** Construct the leaves and their supported request flags. */
function leagueCommands() {
  return [
    leagueLeaf("get", "Fetch league details").option(
      "--include-licenses [boolean]",
      "Include driver licenses (true/false)",
    ),
    leagueLeaf("roster", "Fetch the league roster").option(
      "--include-licenses [boolean]",
      "Include driver licenses (true/false)",
    ),
    leagueLeaf("seasons", "Fetch league seasons").option(
      "--retired [boolean]",
      "Include retired seasons (true/false)",
    ),
    leagueLeaf("sessions", "Fetch season sessions")
      .requiredOption("--season-id <id>", "League season ID")
      .option(
        "--results-only [boolean]",
        "Only sessions with results (true/false)",
      ),
    leagueLeaf("standings", "Fetch season standings")
      .requiredOption("--season-id <id>", "League season ID")
      .option("--car-class-id <id>", "Car class ID")
      .option("--car-id <id>", "Car ID"),
    leagueLeaf("points-systems", "Fetch league points systems").option(
      "--season-id <id>",
      "League season ID",
    ),
    new Command("membership")
      .description(
        "Fetch league memberships (defaults to the authenticated member)",
      )
      .option("--cust-id <id>", "Customer ID")
      .option(
        "--include-league [boolean]",
        "Include league details (true/false)",
      ),
    new Command("customer-sessions")
      .description("Fetch customer league sessions")
      .option("--mine [boolean]", "Only sessions created by you (true/false)")
      .option("--package-id <id>", "Car or track package ID"),
    directoryCommand(),
  ];
}

/** Build a leaf requiring a league identifier. */
function leagueLeaf(name: LeagueRequest["operation"], description: string) {
  return new Command(name)
    .description(description)
    .requiredOption("--league-id <id>", "iRacing league ID");
}

/** Build league discovery flags without introducing defaults over API defaults. */
function directoryCommand() {
  return new Command("directory")
    .description("Search the league directory")
    .option("--search <text>", "League name, description, owner, or ID")
    .option("--tag <tags>", "Comma-separated tags")
    .option("--restrict-to-member [boolean]", "Only your leagues (true/false)")
    .option(
      "--restrict-to-recruiting [boolean]",
      "Only recruiting leagues (true/false)",
    )
    .option(
      "--restrict-to-friends [boolean]",
      "Only friend-owned leagues (true/false)",
    )
    .option(
      "--restrict-to-watched [boolean]",
      "Only watched-owner leagues (true/false)",
    )
    .option("--minimum-roster-count <count>", "Minimum roster size")
    .option("--maximum-roster-count <count>", "Maximum roster size")
    .option("--lowerbound <row>", "First result row")
    .option("--upperbound <row>", "Last result row")
    .option(
      "--sort <field>",
      "relevance, leaguename, displayname, or rostercount",
    )
    .option("--order <direction>", "asc or desc");
}
