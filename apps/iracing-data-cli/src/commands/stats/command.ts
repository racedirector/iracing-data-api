import { Command } from "@commander-js/extra-typings";
import * as schema from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Canonical statistics request variants. */
export const StatsRequestSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("member-bests"),
    query: schema.StatsMemberBestsParametersSchema,
  }),
  z.object({
    operation: z.literal("member-career"),
    query: schema.StatsMemberCareerParametersSchema,
  }),
  z.object({
    operation: z.literal("member-division"),
    query: schema.StatsMemberDivisionParametersSchema,
  }),
  z.object({
    operation: z.literal("member-recap"),
    query: schema.StatsMemberRecapParametersSchema,
  }),
  z.object({
    operation: z.literal("member-recent-races"),
    query: schema.StatsMemberRecentRacesParametersSchema,
  }),
  z.object({
    operation: z.literal("member-summary"),
    query: schema.StatsMemberSummaryParametersSchema,
  }),
  z.object({
    operation: z.literal("member-yearly"),
    query: schema.StatsMemberYearlyParametersSchema,
  }),
  z.object({
    operation: z.literal("season-driver-standings"),
    query: schema.StatsSeasonDriverStandingsParametersSchema,
  }),
  z.object({
    operation: z.literal("season-supersession-standings"),
    query: schema.StatsSeasonSupersessionStandingsParametersSchema,
  }),
  z.object({
    operation: z.literal("season-team-standings"),
    query: schema.StatsSeasonTeamStandingsParametersSchema,
  }),
  z.object({
    operation: z.literal("season-tt-standings"),
    query: schema.StatsSeasonTTStandingsParametersSchema,
  }),
  z.object({
    operation: z.literal("season-tt-results"),
    query: schema.StatsSeasonTTResultsParametersSchema,
  }),
  z.object({
    operation: z.literal("season-qualify-results"),
    query: schema.StatsSeasonQualifyResultsParametersSchema,
  }),
  z.object({
    operation: z.literal("world-records"),
    query: schema.StatsWorldRecordsParametersSchema,
  }),
]);

/** Validated statistics invocation and credential selection. */
export interface StatsOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected API request. */
  request: z.output<typeof StatsRequestSchema>;

  /** Emit modeled wire JSON instead of downloading cached data. */
  responseOnly?: boolean;
}

/** Host-owned statistics retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch the requested statistics.
   * @param {StatsOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Statistics JSON.
   */
  fetchStats(options: StatsOptions): Promise<unknown>;

  /**
   * Display successfully retrieved statistics.
   * @param {unknown} document - Statistics JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind statistics retrieval to output.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: StatsOptions) => {
    service.present(await service.fetchStats(options));
  };
}

/**
 * Build the statistics group.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Statistics commands.
 */
export function createStatsCommand(service: CreateExecuteOptions) {
  const group = new Command("stats").description(
    "Fetch member and championship statistics as JSON",
  );

  const execute = createExecute(service);

  for (const leaf of statsLeaves()) {
    leaf.option(
      "--response-only",
      "Return modeled response JSON without downloading cache data",
    );
    leaf.action(async (raw: Record<string, unknown>, command: Command) => {
      const query = Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [
          key.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
          value,
        ]),
      );

      await execute({
        request: StatsRequestSchema.parse({ operation: leaf.name(), query }),
        responseOnly: raw.responseOnly === true,
        ...readCredentialOptions(command),
      });
    });
    group.addCommand(leaf);
  }

  return group;
}

/** Construct statistics leaves and operation-specific flags. */
function statsLeaves(): Command[] {
  const members = [
    "member-bests",
    "member-career",
    "member-recap",
    "member-recent-races",
    "member-summary",
    "member-yearly",
  ].map((name) =>
    new Command(name)
      .description(`Fetch ${name} statistics`)
      .option("--cust-id <id>", "Customer ID (defaults to your account)"),
  );

  members[0].option(
    "--car-id <id>",
    "Car ID; omit on the first call to discover cars driven",
  );
  members[2]
    .option("--year <year>", "Calendar year")
    .option("--season <quarter>", "Season quarter (1–4)");

  const standings = [
    "season-driver-standings",
    "season-supersession-standings",
    "season-team-standings",
    "season-tt-standings",
    "season-tt-results",
    "season-qualify-results",
  ].map((name) => {
    const leaf = new Command(name)
      .description(`Fetch ${name}`)
      .requiredOption("--season-id <id>", "Season ID")
      .requiredOption("--car-class-id <id>", "Car class ID");

    if (name.endsWith("-results")) {
      leaf.requiredOption("--race-week-num <week>", "Zero-based race week");
    } else {
      leaf.option("--race-week-num <week>", "Zero-based race week");
    }

    if (name !== "season-team-standings") {
      leaf.option("--division <division>", "Zero-based division (10: Rookie)");
    }

    return leaf;
  });

  return [
    ...members,
    new Command("member-division")
      .description("Fetch your division for a season")
      .requiredOption("--season-id <id>", "Season ID")
      .requiredOption("--event-type <type>", "4: Time Trial, 5: Race"),
    ...standings,
    new Command("world-records")
      .description("Fetch world records for a car and track")
      .requiredOption("--car-id <id>", "Car ID")
      .requiredOption("--track-id <id>", "Track ID")
      .option("--season-year <year>", "Season year")
      .option("--season-quarter <quarter>", "Season quarter (use with year)"),
  ];
}
