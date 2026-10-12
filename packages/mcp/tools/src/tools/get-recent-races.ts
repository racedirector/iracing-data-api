import { StatsApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { registerTool } from "../execution.js";
import { materialize, parse } from "../linked-response.js";
import { completeResult } from "./collections.js";
import {
  Id,
  optionalText,
  optionalId,
  optionalInteger,
  optionalNumber,
} from "./primitives.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";
/** Register get_recent_races on the caller-owned server. */
export function registerGetRecentRaces(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(
    server,
    services,
    "get_recent_races",
    "Return at most ten entries from the upstream recent-race window, in upstream order. Not exhaustive history. Positions retain upstream indexing; requires iracing.auth.",
    RecentInput,
    z.object({
      cust_id: Id,
      races: z.array(
        z.object({
          subsession_id: Id,
          series_id: Id.nullable(),
          series_name: z.string().nullable(),
          season_year: z.number().int().nullable(),
          season_quarter: z.number().int().nullable(),
          track_id: Id.nullable(),
          track_name: z.string().nullable(),
          car_id: Id.nullable(),
          session_start_time: z.iso.datetime({ offset: true }).nullable(),
          start_position: z.number().int().nullable(),
          finish_position: z.number().int().nullable(),
          laps: z.number().int().nullable(),
          incidents: z.number().int().nullable(),
          points: z.number().nullable(),
          oldi_rating: z.number().int().nullable(),
          newi_rating: z.number().int().nullable(),
        }),
      ),
      returned_count: z.number().int(),
      complete: z.literal(true),
      position_basis: z.literal("upstream"),
    }),
    async (input, access, context) => {
      const resolved = await materialize(
        await new StatsApi(access.configuration).getStatsMemberRecentRaces(
          input.cust_id === undefined ? {} : { cust_id: input.cust_id },
          { signal: context.signal },
        ),
        z.object({
          cust_id: Id,
          races: z.array(z.record(z.string(), z.unknown())),
        }),
        context.signal,
        access.configuration.fetchApi,
      );
      const source = resolved.data;

      const cust_id = parse(Id, source.cust_id);

      if (input.cust_id !== undefined && cust_id !== input.cust_id) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      const races = parse(z.array(RecentProjection), source.races).slice(
        0,
        input.limit,
      );

      return completeResult({
        cust_id,
        races,
        returned_count: races.length,
        complete: true,
        position_basis: "upstream",
      });
    },
  );
}

export const RecentInput = z.strictObject({
  cust_id: Id.optional(),
  limit: z.number().int().min(1).max(10).default(10),
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
