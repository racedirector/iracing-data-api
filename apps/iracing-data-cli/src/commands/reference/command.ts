import { Command } from "@commander-js/extra-typings";
import {
  SeasonListParametersSchema,
  SeasonRaceGuideParametersSchema,
  SeasonSpectatorSubsessionidsParametersSchema,
  SeasonSpectatorSubsessionidsDetailParametersSchema,
  SeriesPastSeasonsParametersSchema,
  SeriesSeasonsParametersSchema,
  SeriesSeasonListParametersSchema,
  SeriesSeasonScheduleParametersSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Canonical season and series requests. */
export const ReferenceRequestSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("season-list"),
    query: SeasonListParametersSchema,
  }),
  z.object({
    operation: z.literal("race-guide"),
    query: SeasonRaceGuideParametersSchema,
  }),
  z.object({
    operation: z.literal("spectator-subsessionids"),
    query: SeasonSpectatorSubsessionidsParametersSchema,
  }),
  z.object({
    operation: z.literal("spectator-subsessionids-detail"),
    query: SeasonSpectatorSubsessionidsDetailParametersSchema,
  }),
  z.object({
    operation: z.literal("past-seasons"),
    query: SeriesPastSeasonsParametersSchema,
  }),
  z.object({
    operation: z.literal("seasons"),
    query: SeriesSeasonsParametersSchema,
  }),
  z.object({
    operation: z.literal("series-season-list"),
    query: SeriesSeasonListParametersSchema,
  }),
  z.object({
    operation: z.literal("season-schedule"),
    query: SeriesSeasonScheduleParametersSchema,
  }),
  z.object({
    operation: z.enum(["series-get", "series-assets", "stats-series"]),
    query: z.object({}),
  }),
]);

/** Validated reference request and credential selection. */
export interface ReferenceOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected API request. */
  request: z.output<typeof ReferenceRequestSchema>;

  /** Return modeled wire JSON without cache materialization. */
  responseOnly?: boolean;
}

/** Host-owned reference retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch the selected document.
   * @param {ReferenceOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Reference JSON.
   */
  fetchReference(options: ReferenceOptions): Promise<unknown>;

  /**
   * Present successfully retrieved JSON.
   * @param {unknown} document - Reference JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind retrieval to presentation.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: ReferenceOptions) => {
    service.present(await service.fetchReference(options));
  };
}

/**
 * Build season and series discovery groups.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command[]} Reference command groups.
 */
// eslint-disable-next-line max-lines-per-function -- Keep the related reference leaf definitions together.
export function createReferenceCommands(service: CreateExecuteOptions) {
  const season = new Command("season").description(
    "Discover seasons, race guides, and spectator sessions",
  );

  const series = new Command("series").description(
    "Fetch series metadata and schedules",
  );

  bind(
    season
      .command("list")
      .requiredOption("--season-year <year>", "Season year")
      .requiredOption("--season-quarter <quarter>", "Season quarter (1–4)"),
    "season-list",
    service,
  );
  bind(
    season
      .command("race-guide")
      .option("--from <time>", "ISO-8601 time with offset")
      .option(
        "--include-end-after-from [boolean]",
        "Include sessions ending after from (true/false)",
      ),
    "race-guide",
    service,
  );
  bind(
    season
      .command("spectator-subsessionids")
      .option("--event-types <types>", "Comma-separated event type IDs"),
    "spectator-subsessionids",
    service,
  );
  bind(
    season
      .command("spectator-subsessionids-detail")
      .option("--event-types <types>", "Comma-separated event type IDs")
      .option("--season-ids <ids>", "Comma-separated season IDs"),
    "spectator-subsessionids-detail",
    service,
  );
  bind(series.command("get"), "series-get", service);
  bind(series.command("assets"), "series-assets", service);
  bind(series.command("stats-series"), "stats-series", service);
  bind(
    series
      .command("past-seasons")
      .requiredOption("--series-id <id>", "Series ID"),
    "past-seasons",
    service,
  );
  bind(
    series
      .command("season-schedule")
      .requiredOption("--season-id <id>", "Season ID"),
    "season-schedule",
    service,
  );
  for (const [name, operation] of [
    ["seasons", "seasons"],
    ["season-list", "series-season-list"],
  ] as const) {
    bind(
      series
        .command(name)
        .option(
          "--include-series [boolean]",
          "Include series metadata (true/false)",
        )
        .option("--season-year <year>", "Season year (use with season quarter)")
        .option(
          "--season-quarter <quarter>",
          "Season quarter (use with season year)",
        ),
      operation,
      service,
    );
  }

  return [season, series];
}

/**
 * Bind local CLI representation to canonical request validation.
 * @param {Command} leaf - Executable leaf.
 * @param {ReferenceOptions["request"]["operation"]} operation - Request operation.
 * @param {CreateExecuteOptions} service - Host operations.
 */
function bind(
  leaf: Command,
  operation: ReferenceOptions["request"]["operation"],
  service: CreateExecuteOptions,
) {
  const execute = createExecute(service);

  leaf.option(
    "--response-only",
    "Return modeled response JSON without downloading cache data",
  );
  leaf.action(async (raw: Record<string, unknown>, command: Command) => {
    const query = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [
        key.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        ["eventTypes", "seasonIds"].includes(key) && typeof value === "string"
          ? value
              .split(",")
              .map((part) => (part.trim() === "" ? Number.NaN : Number(part)))
          : value,
      ]),
    );

    await execute({
      request: ReferenceRequestSchema.parse({ operation, query }),
      responseOnly: raw.responseOnly === true,
      ...readCredentialOptions(command),
    });
  });
}
