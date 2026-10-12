/**
 * Authored MCP input/projection contracts, distinct from public wire schemas.
 *
 * Strict inputs reject unknown keys, numeric strings and cursor/filter mixtures.
 * Projection schemas allowlist returned fields and normalize unavailable optional
 * values to null. These declarations own page/input bounds, calendar/date/week and
 * position conventions; generated Data API models remain upstream wire ownership.
 * Changing required inputs, ordering/basis, completeness or retryability requires
 * explicit application compatibility review and fixture migration. Tool version
 * 0.0.0 is private and supplies no published stable-version guarantee.
 */
import { z } from "zod";

export const Id = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const query = z.string().trim().min(2).max(100);

const limit = z.number().int().min(1).max(100).default(25);

const seasonYear = z.number().int().min(2000).max(2100);

const seasonQuarter = z.number().int().min(1).max(4);

export const ContinuationInput = z.strictObject({
  cursor: z.string().min(1).max(512),
});
export const SelfInput = z.strictObject({});
export const DriversInput = z.union([
  z.strictObject({ query, league_id: Id.optional(), limit }),
  ContinuationInput,
]);
export const RecentInput = z.strictObject({
  cust_id: Id.optional(),
  limit: z.number().int().min(1).max(10).default(10),
});
export const ContentInput = z.union([
  z
    .strictObject({
      kind: z.enum(["cars", "tracks"]),
      ids: z
        .array(Id)
        .min(1)
        .max(50)
        .refine((ids) => new Set(ids).size === ids.length)
        .optional(),
      query: query.optional(),
      limit,
    })
    .refine((value) => !(value.ids && value.query)),
  ContinuationInput,
]);

export const SeriesSeasonsInput = z.union([
  z
    .strictObject({
      series_id: Id.optional(),
      season_year: seasonYear.optional(),
      season_quarter: seasonQuarter.optional(),
      limit,
    })
    .refine(
      (value) =>
        (value.season_year === undefined) ===
        (value.season_quarter === undefined),
    ),
  ContinuationInput,
]);
export const SeriesScheduleInput = z.union([
  z.strictObject({
    season_id: Id,
    race_week_num: z.number().int().min(0).max(52).optional(),
    limit,
  }),
  ContinuationInput,
]);

// These are app projections, not replacements for authored wire contracts.
// object() strips every unlisted upstream field; absent optional data is null.
const text = z.string();

const optionalText = text.nullish().transform((value) => value ?? null);

const optionalId = Id.nullish().transform((value) => value ?? null);

const optionalInteger = z
  .number()
  .int()
  .safe()
  .nullish()
  .transform((value) => value ?? null);

const optionalNumber = z
  .number()
  .finite()
  .nullish()
  .transform((value) => value ?? null);

const optionalBoolean = z
  .boolean()
  .nullish()
  .transform((value) => value ?? null);

export const DriverProjection = z.object({
  cust_id: Id,
  display_name: text.min(1),
});
export const CarProjection = z.object({
  car_id: Id,
  car_name: text.min(1),
  car_name_abbreviated: optionalText,
});
export const TrackProjection = z.object({
  track_id: Id,
  track_name: text.min(1),
  config_name: optionalText,
  category_id: optionalId,
  is_oval: optionalBoolean,
  is_dirt: optionalBoolean,
});
export const RecentProjection = z
  .object({
    subsession_id: Id,
    series_id: optionalId,
    series_name: optionalText,
    season_year: optionalInteger,
    season_quarter: z
      .number()
      .int()
      .min(1)
      .max(4)
      .nullish()
      .transform((value) => value ?? null),
    track: z.object({ track_id: Id, track_name: optionalText }).nullish(),
    car_id: optionalId,
    session_start_time: z.iso
      .datetime({ offset: true })
      .nullish()
      .transform((value) => value ?? null),
    start_position: optionalInteger,
    finish_position: optionalInteger,
    laps: optionalInteger,
    incidents: optionalInteger,
    points: optionalNumber,
    oldi_rating: optionalInteger,
    newi_rating: optionalInteger,
  })
  .transform(({ track, ...race }) => ({
    ...race,
    track_id: track?.track_id ?? null,
    track_name: track?.track_name ?? null,
  }));
export const SeriesSeasonProjection = z.object({
  season_id: Id,
  series_id: Id,
  season_name: text.min(1),
  season_year: seasonYear,
  season_quarter: seasonQuarter,
  active: z.boolean(),
});
export const SeriesScheduleProjection = z.object({
  race_week_num: z.number().int().min(0).max(52),
  start_date: z.iso.date(),
  week_end_time: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value).toISOString()),
  series_id: Id,
  series_name: text.min(1),
  track: z.object({
    track_id: Id,
    track_name: text.min(1),
    config_name: optionalText,
  }),
});

export const RaceResultInput = z.union([
  z.strictObject({
    subsession_id: Id,
    cust_ids: z
      .array(Id)
      .min(1)
      .max(10)
      .refine((ids) => new Set(ids).size === ids.length)
      .optional(),
    simsession_number: z.number().int().min(-20).max(20).default(0),
    limit,
  }),
  ContinuationInput,
]);
const position = z
  .number()
  .int()
  .safe()
  .max(Number.MAX_SAFE_INTEGER - 1)
  .nullish()
  .transform((value) => (value == null || value < 0 ? null : value + 1));

export const RaceContextProjection = z.object({
  subsession_id: Id,
  start_time: z.iso
    .datetime({ offset: true })
    .nullish()
    .transform((v) => v ?? null),
  series_id: optionalId,
  series_name: optionalText,
  season_id: optionalId,
  track: z.object({
    track_id: Id,
    track_name: optionalText,
    config_name: optionalText,
  }),
});
export const RaceSessionProjection = z.object({
  simsession_number: z.number().int().safe(),
  results: z.array(z.record(z.string(), z.unknown())),
});
export const RaceParticipantProjection = z
  .object({
    cust_id: optionalId,
    team_id: optionalId,
    display_name: text.min(1),
    car_id: optionalId,
    car_class_id: optionalId,
    starting_position: position,
    finish_position: position,
    finish_position_in_class: position,
    laps_complete: optionalInteger,
    incidents: optionalInteger,
    champ_points: optionalNumber,
    oldi_rating: optionalInteger,
    newi_rating: optionalInteger,
    reason_out: optionalText,
  })
  .refine((row) => row.cust_id !== null || row.team_id !== null);

export const SearchInitialInput = z.strictObject({
  cust_id: Id.optional(),
  range: z.union([
    z
      .strictObject({ start: z.iso.datetime(), start_end: z.iso.datetime() })
      .refine(
        (range) =>
          Date.parse(range.start_end) > Date.parse(range.start) &&
          Date.parse(range.start_end) - Date.parse(range.start) <=
            90 * 86400000,
      ),
    z.strictObject({ season_year: seasonYear, season_quarter: seasonQuarter }),
  ]),
  series_id: Id.optional(),
  track_ids: z
    .array(Id)
    .min(1)
    .max(50)
    .refine((ids) => new Set(ids).size === ids.length)
    .optional(),
  official_only: z.boolean().optional(),
  limit,
});
export const SearchInput = z.union([SearchInitialInput, ContinuationInput]);
export const SearchProjection = z.object({
  subsession_id: Id,
  start_time: z.iso.datetime({ offset: true }),
  end_time: z.iso
    .datetime({ offset: true })
    .nullish()
    .transform((v) => v ?? null),
  season_id: optionalId,
  series_id: optionalId,
  series_name: optionalText,
  track: z.object({
    track_id: Id,
    track_name: optionalText,
    config_name: optionalText,
  }),
  event_type: z.number().int().safe(),
  num_drivers: z
    .number()
    .int()
    .nonnegative()
    .safe()
    .nullish()
    .transform((v) => v ?? null),
  official_session: optionalBoolean,
});
