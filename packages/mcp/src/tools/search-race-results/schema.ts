import { z } from "zod";
import type { DetailReason } from "../../diagnostics/errors.js";

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
  readonly reason: DetailReason;
}

/** Explicit upstream filters; no participant or event type is assumed. */
const SearchFields = z.strictObject({
  source: z.enum(["series", "hosted"]).meta({
    description: "Series results or hosted results, including leagues.",
  }),
  cust_id: id.optional().meta({
    description:
      "Participant customer ID; omitted means no participant filter, not the authenticated driver.",
  }),
  team_id: id.optional().meta({
    description:
      "Participant team ID. Upstream ignores cust_id when this is supplied.",
  }),
  season_year: z.int().positive().optional().meta({
    description: "Series only: season year; supply with season_quarter.",
  }),
  season_quarter: z.int().min(1).max(4).optional().meta({
    description: "Series only: season quarter 1-4; supply with season_year.",
  }),
  start_range_begin: utc.optional().meta({
    description:
      "UTC session-start filter. Maximum range is 90 days. If start_range_end is omitted, the begin must be less than 90 days old and not in the future.",
  }),
  start_range_end: utc.optional().meta({
    description:
      "Exclusive UTC end, later than start_range_begin and at most 90 days after it. Required for older historical windows; omit only when begin is less than 90 days old.",
  }),
  finish_range_begin: utc.optional().meta({
    description:
      "UTC session-finish filter. Maximum range is 90 days. If finish_range_end is omitted, the begin must be less than 90 days old and not in the future.",
  }),
  finish_range_end: utc.optional().meta({
    description:
      "Exclusive UTC end, later than finish_range_begin and at most 90 days after it. Required for older historical windows; omit only when begin is less than 90 days old.",
  }),
  series_id: id.optional().meta({
    description: "Series only: include only sessions for this series.",
  }),
  race_week_num: z.int().nonnegative().optional().meta({
    description: "Series only: include only this zero-based race week number.",
  }),
  official_only: z.boolean().optional().meta({
    description:
      "Series only: restrict to sessions earning championship points when true.",
  }),
  event_types: ids.optional().meta({
    description:
      "Series only: comma-separated event IDs: 2 practice, 3 qualifying, 4 time trial, 5 race. Not special-event classification.",
  }),
  category_ids: ids.optional().meta({
    description:
      "Comma-separated category IDs: license categories for series, track categories for hosted.",
  }),
  host_cust_id: id.optional().meta({
    description: "Hosted only: the host's customer ID.",
  }),
  session_name: z.string().min(1).optional().meta({
    description: "Hosted only: part or all of the session's name.",
  }),
  league_id: id.optional().meta({
    description: "Hosted only: include only results for this league.",
  }),
  league_season_id: id.optional().meta({
    description: "Hosted only: include only results for this league season.",
  }),
  car_id: id.optional().meta({
    description: "Hosted only: one of the cars used by the session.",
  }),
  track_id: id.optional().meta({
    description: "Hosted only: the track used by the session.",
  }),
  chunk_index: z.int().nonnegative().default(0).meta({
    description:
      "Zero-based upstream chunk to retrieve. Each call reruns the search, not a stable snapshot.",
  }),
});

type SearchValues = z.output<typeof SearchFields>;

/**
 * Filters the authenticated upstream docs do not accept for each source.
 * `/results/search_series` documents no car, track, host, session or league
 * filter; `/results/search_hosted` documents no season, series or event filter.
 */
const unsupportedFilters = {
  series: [
    "host_cust_id",
    "session_name",
    "league_id",
    "league_season_id",
    "car_id",
    "track_id",
  ],
  hosted: [
    "season_year",
    "season_quarter",
    "series_id",
    "race_week_num",
    "official_only",
    "event_types",
  ],
} as const;

/** Hosted search requires one of the documented participant or host selectors. */
const hostedSelectors = [
  "cust_id",
  "team_id",
  "host_cust_id",
  "session_name",
] as const;

/** Input contract whose rejections the execution adapter projects into details. */
export const SearchInput = SearchFields.superRefine((value, context) => {
  rejectUnsupportedFilters(value, context);
  requireSeasonPair(value, context);
  requireDateScope(value, context);
  requireHostedSelector(value, context);
  refineTimeRanges(value, context);
});

function rejectUnsupportedFilters(
  value: SearchValues,
  context: z.RefinementCtx,
): void {
  for (const key of unsupportedFilters[value.source]) {
    if (value[key] !== undefined) {
      context.addIssue({
        code: "custom",
        path: [key],
        message: `Not supported for ${value.source} search`,
        params: { reason: "unsupported_for_source" },
      });
    }
  }
}

function requireSeasonPair(
  value: SearchValues,
  context: z.RefinementCtx,
): void {
  if (value.source !== "series") {
    return;
  }

  const hasYear = value.season_year !== undefined;

  const hasQuarter = value.season_quarter !== undefined;

  if (hasYear === hasQuarter) {
    return;
  }

  context.addIssue({
    code: "custom",
    path: [hasYear ? "season_year" : "season_quarter"],
    message: "Supply season_year and season_quarter together",
    params: { reason: "required_together" },
  });
}

/** Upstream accepts neither search without a date or season scope. */
function requireDateScope(value: SearchValues, context: z.RefinementCtx): void {
  const hasRange =
    value.start_range_begin !== undefined ||
    value.finish_range_begin !== undefined;

  const hasSeason =
    value.source === "series" && value.season_year !== undefined;

  if (hasRange || hasSeason) {
    return;
  }

  context.addIssue({
    code: "custom",
    path: ["start_range_begin"],
    message:
      value.source === "series"
        ? "Supply a season or a start/finish range"
        : "Supply a start or finish range",
    params: { reason: "missing_range" },
  });
}

/**
 * Reject a hosted search without one documented selector. Each alternative is a
 * valid fix, so all four are reported rather than an arbitrary single field.
 */
function requireHostedSelector(
  value: SearchValues,
  context: z.RefinementCtx,
): void {
  if (value.source !== "hosted") {
    return;
  }

  const supplied = hostedSelectors.some((key) => value[key] !== undefined);

  if (supplied) {
    return;
  }

  for (const key of hostedSelectors) {
    context.addIssue({
      code: "custom",
      path: [key],
      message:
        "Hosted search requires one of cust_id, team_id, host_cust_id, or session_name",
      params: { reason: "required_for_source" },
    });
  }
}

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
        params: { reason: issue.reason },
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
    return {
      at: "end",
      message: "Range end requires an earlier range begin",
      reason: "range_end_before_begin",
    };
  }

  if (
    Number.isFinite(start) &&
    Number.isFinite(stop) &&
    stop - start > maximumRangeMs
  ) {
    return {
      at: "end",
      message: "Search ranges must not exceed 90 days",
      reason: "range_too_wide",
    };
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
      reason: "begin_in_future",
    };
  }

  if (now - start >= maximumRangeMs) {
    return {
      at: "end",
      message:
        "Specify an end within 90 days of the begin when the begin is 90 days old or older",
      reason: "missing_range",
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
