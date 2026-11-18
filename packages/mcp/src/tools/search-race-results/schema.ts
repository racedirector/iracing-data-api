import { z } from "zod";

const id = z.int().positive();

const utc = z.iso.datetime();

const ids = z.string().regex(/^\d+(?:,\d+)*$/);

const maximumRangeMs = 90 * 24 * 60 * 60 * 1000;

const timeRanges = [
  ["start_range_begin", "start_range_end"],
  ["finish_range_begin", "finish_range_end"],
] as const;

type TimeRanges = Partial<Record<(typeof timeRanges)[number][number], string>>;

interface TimeRangeIssue {
  readonly at: "begin" | "end";
  readonly message: string;
}

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
    start_range_begin: utc
      .optional()
      .describe(
        "UTC session-start filter. Maximum range is 90 days. If start_range_end is omitted, the begin must be less than 90 days old and not in the future.",
      ),
    start_range_end: utc
      .optional()
      .describe(
        "Exclusive UTC end, later than start_range_begin and at most 90 days after it. Required for older historical windows; omit only when begin is less than 90 days old.",
      ),
    finish_range_begin: utc
      .optional()
      .describe(
        "UTC session-finish filter. Maximum range is 90 days. If finish_range_end is omitted, the begin must be less than 90 days old and not in the future.",
      ),
    finish_range_end: utc
      .optional()
      .describe(
        "Exclusive UTC end, later than finish_range_begin and at most 90 days after it. Required for older historical windows; omit only when begin is less than 90 days old.",
      ),
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

    refineTimeRanges(value, context);
  });

/** Enforce both documented time windows without truncating or partitioning input. */
function refineTimeRanges(value: TimeRanges, context: z.RefinementCtx): void {
  const now = Date.now();

  for (const [beginField, endField] of timeRanges) {
    const begin = value[beginField];

    const end = value[endField];

    const issue = end
      ? explicitRangeIssue(begin, end)
      : openRangeIssue(begin, now);

    if (issue) {
      context.addIssue({
        code: "custom",
        path: [issue.at === "begin" ? beginField : endField],
        message: issue.message,
      });
    }
  }
}

function explicitRangeIssue(
  begin: string | undefined,
  end: string,
): TimeRangeIssue | undefined {
  const start = begin ? Date.parse(begin) : Number.NaN;

  const stop = Date.parse(end);

  if (!begin || stop <= start) {
    return { at: "end", message: "Range end requires an earlier range begin" };
  }

  if (
    Number.isFinite(start) &&
    Number.isFinite(stop) &&
    stop - start > maximumRangeMs
  ) {
    return { at: "end", message: "Search ranges must not exceed 90 days" };
  }

  return undefined;
}

function openRangeIssue(
  begin: string | undefined,
  now: number,
): TimeRangeIssue | undefined {
  if (!begin) {
    return undefined;
  }

  const start = Date.parse(begin);

  if (!Number.isFinite(start)) {
    return undefined;
  }

  if (start > now) {
    return {
      at: "begin",
      message: "With no end, range begin must not be in the future",
    };
  }

  if (now - start >= maximumRangeMs) {
    return {
      at: "end",
      message:
        "Specify an end within 90 days of the begin when the begin is 90 days old or older",
    };
  }

  return undefined;
}

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
