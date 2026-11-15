import { z } from "zod";
import {
  Id,
  optionalId,
  optionalInteger,
  optionalNumber,
  optionalText,
} from "../primitives.js";

/** Optional customer ID; requests never accept tokens or arbitrary properties. */
export const RecentInput = z.strictObject({
  cust_id: Id.optional(),
  limit: z.int().min(1).max(10).default(10),
});

/** Already-normalized race data provided by a consumer-owned query service. */
export const RecentProjection = z.object({
  subsession_id: Id,
  series_id: optionalId,
  series_name: optionalText,
  season_year: optionalInteger,
  season_quarter: z.int().min(1).max(4).nullish().transform((value) => value ?? null),
  track_id: optionalId,
  track_name: optionalText,
  car_id: optionalId,
  session_start_time: z.iso.datetime({ offset: true }).nullish().transform((value) => value ?? null),
  start_position: optionalInteger,
  finish_position: optionalInteger,
  laps: optionalInteger,
  incidents: optionalInteger,
  points: optionalNumber,
  oldi_rating: optionalInteger,
  newi_rating: optionalInteger,
});

/** The injected capability provides the upstream recent-race window, not paged history. */
export const RecentRaceWindowSchema = z.object({
  cust_id: Id,
  races: z.array(RecentProjection),
});

export type RecentRaceWindow = z.infer<typeof RecentRaceWindowSchema>;

export const RecentOutputSchema = z.object({
  cust_id: Id,
  races: z.array(RecentProjection),
  returned_count: z.int().nonnegative(),
  complete: z.literal(true),
  position_basis: z.literal("upstream"),
});
