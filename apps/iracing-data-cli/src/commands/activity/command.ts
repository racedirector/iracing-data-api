import { Command } from "@commander-js/extra-typings";
import * as schema from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Decode CSV flags before passing typed collection inputs to the SDK. */
const SearchSeriesCliParametersSchema =
  schema.ResultsSearchSeriesParametersSchema.extend({
    event_types: schema.EventTypesParameterSchema.optional().transform(
      (value) =>
        value?.split(",").map((id) => schema.EventTypeSchema.parse(Number(id))),
    ),
    category_ids: schema.CategoryIdsParameterSchema.optional().transform(
      (value) => value?.split(",").map(Number),
    ),
  }).transform(({ event_types, category_ids, ...rest }) =>
    schema.ResultsSearchSeriesParametersSchema.parse({
      ...rest,
      ...(event_types === undefined ? {} : { event_types }),
      ...(category_ids === undefined ? {} : { category_ids }),
    }),
  );

/** Canonical result-detail, driver, session, and time-attack requests. */
export const ActivityRequestSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("event-log"),
    query: schema.ResultsEventLogParametersSchema,
  }),
  z.object({
    operation: z.literal("lap-chart-data"),
    query: schema.ResultsLapChartDataParametersSchema,
  }),
  z.object({
    operation: z.literal("lap-data"),
    query: schema.ResultsLapDataParametersSchema,
  }),
  z.object({
    operation: z.literal("search-series"),
    query: SearchSeriesCliParametersSchema,
  }),
  z.object({
    operation: z.literal("season-results"),
    query: schema.ResultsSeasonResultsParametersSchema,
  }),
  z.object({
    operation: z.literal("driver-stats"),
    query: schema.DriverStatsByCategoryPathSchema,
  }),
  z.object({
    operation: z.literal("registered-drivers"),
    query: schema.SessionRegisteredDriversParametersSchema,
  }),
  z.object({
    operation: z.literal("time-attack"),
    query: schema.TimeAttackMemberSeasonResultsParametersSchema,
  }),
]);

/** Validated activity request and credential selection. */
export interface ActivityOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected API request. */
  request: z.output<typeof ActivityRequestSchema>;

  /** Return modeled wire JSON without cache materialization. */
  responseOnly?: boolean;
}

/** Host-owned activity retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch a result detail or activity document.
   * @param {ActivityOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Activity JSON.
   */
  fetchActivity(options: ActivityOptions): Promise<unknown>;

  /**
   * Present successfully retrieved JSON.
   * @param {unknown} document - Activity JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind retrieval to presentation.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: ActivityOptions) => {
    service.present(await service.fetchActivity(options));
  };
}

/**
 * Build activity and result-detail commands.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command[]} Root commands.
 */
export function createActivityCommands(service: CreateExecuteOptions) {
  const execute = createExecute(service);

  const leaves = activityLeaves();

  const timeAttack = new Command("time-attack").description(
    "Time attack results",
  );

  const session = new Command("session").description(
    "Session registration data",
  );

  const roots: Command[] = [];

  for (const [operation, leaf] of leaves) {
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
        request: ActivityRequestSchema.parse({ operation, query }),
        responseOnly: raw.responseOnly === true,
        ...readCredentialOptions(command),
      });
    });

    if (operation === "time-attack") {
      timeAttack.addCommand(leaf);
    } else if (operation === "registered-drivers") {
      session.addCommand(leaf);
    } else {
      roots.push(leaf);
    }
  }

  return [...roots, timeAttack, session];
}

/** Construct endpoint-specific activity flags. */
function activityLeaves(): [
  ActivityOptions["request"]["operation"],
  Command,
][] {
  const detail = (name: string) =>
    new Command(`results-${name}`)
      .description(`Fetch results ${name}`)
      .requiredOption("--subsession-id <id>", "Subsession ID")
      .requiredOption(
        "--simsession-number <number>",
        "Main event: 0; preceding events: -1, -2, etc.",
      );

  return [
    ["event-log", detail("event-log")],
    ["lap-chart-data", detail("lap-chart-data")],
    [
      "lap-data",
      detail("lap-data")
        .option("--cust-id <id>", "Required for single-driver events")
        .option("--team-id <id>", "Required for team events"),
    ],
    ["search-series", searchSeriesCommand()],
    [
      "season-results",
      new Command("results-season-results")
        .description("Fetch a season's results")
        .requiredOption("--season-id <id>", "Season ID")
        .option(
          "--event-type <type>",
          "2: Practice, 3: Qualify, 4: Time Trial, 5: Race",
        )
        .option("--race-week-num <week>", "Zero-based race week"),
    ],
    [
      "driver-stats",
      new Command("driver-stats-by-category")
        .description("Fetch driver statistics by license category")
        .requiredOption("--category <category>", "License category"),
    ],
    [
      "registered-drivers",
      new Command("registered-drivers")
        .description("Fetch drivers registered for a subsession")
        .requiredOption("--subsession-id <id>", "Subsession ID"),
    ],
    [
      "time-attack",
      new Command("member-season-results")
        .description("Fetch your time-attack season results")
        .requiredOption(
          "--ta-comp-season-id <id>",
          "Time-attack competition season ID",
        ),
    ],
  ];
}

/** Construct series-search filters without overriding upstream defaults. */
function searchSeriesCommand() {
  const search = new Command("results-search-series").description(
    "Search official series results; retain chunk references",
  );

  for (const flag of [
    "season-year",
    "season-quarter",
    "start-range-begin",
    "start-range-end",
    "finish-range-begin",
    "finish-range-end",
    "cust-id",
    "team-id",
    "series-id",
    "race-week-num",
    "event-types",
    "category-ids",
  ]) {
    search.option(`--${flag} <value>`, flag.replaceAll("-", " "));
  }

  return search.option(
    "--official-only [boolean]",
    "Only championship-point sessions (true/false)",
  );
}
