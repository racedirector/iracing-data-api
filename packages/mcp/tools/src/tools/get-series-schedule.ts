import { SeriesApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { continuation } from "../continuation.js";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { registerTool, pageOutput } from "../execution.js";
import { materialize, parse } from "../linked-response.js";
import {
  Id,
  limit,
  ContinuationInput,
  text,
  optionalText,
} from "./primitives.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";
/** Register get_series_schedule on the caller-owned server. */
export function registerGetSeriesSchedule(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(
    server,
    services,
    "get_series_schedule",
    "Get one season schedule. race_week_num is the upstream zero-based race week (0 is the first week). Optional week filtering is local; results are deterministically ordered. Continue with cursor alone. No weather, assets, duration or recurrence interpretation.",
    SeriesScheduleInput,
    pageOutput(
      z.object({
        race_week_num: z.number().int(),
        start_date: z.iso.date(),
        week_end_time: z.iso.datetime(),
        series_id: Id,
        series_name: z.string(),
        track: z.object({
          track_id: Id,
          track_name: z.string(),
          config_name: z.string().nullable(),
        }),
      }),
      { season_id: Id },
    ),
    async (input, access, context) => {
      const owner = continuation(access.continuationScope).collections;

      if ("cursor" in input) {
        return owner.resume("get_series_schedule", input.cursor);
      }

      const resolved = await materialize(
        await new SeriesApi(access.configuration).getSeriesSeasonSchedule(
          { season_id: input.season_id },
          { signal: context.signal },
        ),
        z.object({
          success: z.literal(true),
          season_id: Id,
          schedules: z.array(z.record(z.string(), z.unknown())),
        }),
        context.signal,
        access.configuration.fetchApi,
      );
      const source = resolved.data;

      const season_id = parse(Id, source.season_id);

      if (season_id !== input.season_id) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      const rows = parse(z.array(SeriesScheduleProjection), source.schedules);

      const selected = rows
        .filter(
          (row) =>
            input.race_week_num === undefined ||
            row.race_week_num === input.race_week_num,
        )
        .sort(
          (a, b) =>
            a.race_week_num - b.race_week_num ||
            a.start_date.localeCompare(b.start_date) ||
            a.week_end_time.localeCompare(b.week_end_time) ||
            a.series_id - b.series_id ||
            a.series_name.localeCompare(b.series_name) ||
            a.track.track_id - b.track.track_id ||
            a.track.track_name.localeCompare(b.track.track_name) ||
            (a.track.config_name ?? "").localeCompare(
              b.track.config_name ?? "",
            ),
        );

      return owner.start({
        tool: "get_series_schedule",
        filters: {
          season_id: input.season_id,
          race_week_num: input.race_week_num,
        },
        items: selected,
        limit: input.limit,
        expiresAt: resolved.expiresAt,
        context: { season_id },
      });
    },
  );
}

export const SeriesScheduleInput = z.union([
  z.strictObject({
    season_id: Id,
    race_week_num: z.number().int().min(0).max(52).optional(),
    limit,
  }),
  ContinuationInput,
]);
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
