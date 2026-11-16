import { z } from "zod";

const id = z.int().positive();

const utc = z.iso.datetime();

const ids = z.string().regex(/^\d+(?:,\d+)*$/);

/** Explicit upstream filters; no participant or event type is assumed. */
export const SearchInput = z
  .strictObject({
    source: z.enum(["series", "hosted"]).meta({
      description: "Series results or hosted results, including leagues.",
    }),
    cust_id: id
      .optional()
      .describe(
        "Participant customer ID; omitted means no participant filter, not the authenticated driver.",
      ),
    team_id: id
      .optional()
      .describe(
        "Participant team ID. Upstream ignores cust_id when this is supplied.",
      ),
    season_year: z.int().positive().optional(),
    season_quarter: z.int().min(1).max(4).optional(),
    start_range_begin: utc.optional(),
    start_range_end: utc.optional(),
    finish_range_begin: utc.optional(),
    finish_range_end: utc.optional(),
    series_id: id.optional(),
    race_week_num: z.int().nonnegative().optional(),
    official_only: z.boolean().optional().meta({
      description:
        "Series only: restrict to sessions earning championship points when true.",
    }),
    event_types: ids
      .optional()
      .describe(
        "Series only: comma-separated event IDs: 2 practice, 3 qualifying, 4 time trial, 5 race. Not special-event classification.",
      ),
    category_ids: ids
      .optional()
      .describe(
        "Comma-separated category IDs: license categories for series, track categories for hosted.",
      ),
    host_cust_id: id.optional(),
    session_name: z.string().min(1).optional(),
    league_id: id.optional(),
    league_season_id: id.optional(),
    car_id: id.optional(),
    track_id: id.optional(),
    chunk_index: z.int().nonnegative().default(0).meta({
      description:
        "Zero-based upstream chunk to retrieve. Each call reruns the search, not a stable snapshot.",
    }),
  })
  .superRefine((value, context) => {
    const unsupported =
      value.source === "series"
        ? ([
            "host_cust_id",
            "session_name",
            "league_id",
            "league_season_id",
            "car_id",
            "track_id",
          ] as const)
        : ([
            "season_year",
            "season_quarter",
            "series_id",
            "race_week_num",
            "official_only",
            "event_types",
          ] as const);

    for (const key of unsupported) {
      if (value[key] !== undefined) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: `Not supported for ${value.source} search`,
        });
      }
    }

    if (
      (value.season_year === undefined) !==
      (value.season_quarter === undefined)
    ) {
      context.addIssue({
        code: "custom",
        message: "Supply season_year and season_quarter together",
      });
    }

    if (
      !value.season_year &&
      !value.start_range_begin &&
      !value.finish_range_begin
    ) {
      context.addIssue({
        code: "custom",
        message: "Supply a season or a start/finish range",
      });
    }

    for (const [begin, end] of [
      [value.start_range_begin, value.start_range_end],
      [value.finish_range_begin, value.finish_range_end],
    ]) {
      if (end && (!begin || Date.parse(end) <= Date.parse(begin))) {
        context.addIssue({
          code: "custom",
          message: "Range end requires an earlier range begin",
        });
      }
    }
  });

/** Allowlisted search rows, preserving upstream indexing and time units. */
export const SearchRow = z.object({
  subsession_id: id,
  session_id: id.optional(),
  start_time: z.string(),
  session_name: z.string().optional(),
  series_id: id.optional(),
  series_name: z.string().optional(),
  league_id: id.optional(),
  league_name: z.string().optional(),
  league_season_id: z.int().nonnegative().optional(),
  cust_id: id.optional(),
  team_id: id.optional(),
  car_id: id.optional(),
  car_name: z.string().optional(),
  track: z
    .object({
      track_id: id,
      track_name: z.string().optional(),
      config_name: z.string().optional(),
    })
    .optional(),
  event_type: z.number().optional(),
  starting_position: z.number().optional(),
  finish_position: z.number().optional(),
  starting_position_in_class: z.number().optional(),
  finish_position_in_class: z.number().optional(),
  laps_complete: z.number().optional(),
  incidents: z.number().optional(),
});

/** Completeness refers only to this explicit query, never lifetime history. */
export const SearchOutput = z.object({
  source: z.enum(["series", "hosted"]),
  criteria: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
  total_matches: z.int().nonnegative(),
  total_chunks: z.int().nonnegative(),
  chunk_index: z.int().nonnegative(),
  returned_count: z.int().nonnegative(),
  query_complete: z.boolean(),
  results: z.array(SearchRow),
  position_basis: z.literal("upstream"),
});

export type RaceSearchInput = z.infer<typeof SearchInput>;
export type RaceSearchOutput = z.infer<typeof SearchOutput>;
