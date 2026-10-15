import { z } from "zod";
import {
  Id,
  limit,
  seasonYear,
  seasonQuarter,
  ContinuationInput,
  optionalText,
  optionalId,
  optionalBoolean,
} from "../primitives.js";

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
  event_type: z.number().int(),
  num_drivers: z
    .number()
    .int()
    .nonnegative()
    .nullish()
    .transform((v) => v ?? null),
  official_session: optionalBoolean,
});
