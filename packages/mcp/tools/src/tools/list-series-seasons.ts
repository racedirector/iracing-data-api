import { SeriesApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { continuation } from "../continuation.js";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { registerTool, pageOutput } from "../execution.js";
import { materialize, parse } from "../linked-response.js";
import {
  Id,
  limit,
  seasonYear,
  seasonQuarter,
  ContinuationInput,
  text,
} from "./primitives.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";

/** Register list_series_seasons on the caller-owned server. */
export function registerListSeriesSeasons(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition);
}

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
export const SeriesSeasonProjection = z.object({
  season_id: Id,
  series_id: Id,
  season_name: text.min(1),
  season_year: seasonYear,
  season_quarter: seasonQuarter,
  active: z.boolean(),
});

const definition = {
  name: "list_series_seasons",
  description:
    "List active series seasons by default, or a historical year/quarter pair. Optionally filter one positive series ID locally. Results are ordered by season ID; continue with cursor alone.",
  inputSchema: SeriesSeasonsInput,
  outputSchema: pageOutput(SeriesSeasonProjection),
  work: async (input, access, context) => {
    const owner = continuation(access.continuationScope).collections;

    if ("cursor" in input) {
      return owner.resume("list_series_seasons", input.cursor);
    }

    const resolved = await materialize(
      await new SeriesApi(access.configuration).getSeriesSeasonList(
        {
          include_series: false,
          ...(input.season_year === undefined
            ? {}
            : {
                season_year: input.season_year,
                season_quarter: input.season_quarter,
              }),
        },
        { signal: context.signal },
      ),
      z.object({ seasons: z.array(z.record(z.string(), z.unknown())) }),
      context.signal,
      access.configuration.fetchApi,
    );

    const source = resolved.data;

    const rows = parse(z.array(SeriesSeasonProjection), source.seasons);

    const seasonIds = rows.map((row) => row.season_id);

    if (new Set(seasonIds).size !== seasonIds.length) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    const selected = rows
      .filter(
        (row) =>
          input.series_id === undefined || row.series_id === input.series_id,
      )
      .sort((a, b) => a.season_id - b.season_id);

    return owner.start({
      tool: "list_series_seasons",
      filters: {
        series_id: input.series_id,
        season_year: input.season_year,
        season_quarter: input.season_quarter,
      },
      items: selected,
      limit: input.limit,
      expiresAt: resolved.expiresAt,
    });
  },
} satisfies ToolDefinition<z.infer<typeof SeriesSeasonsInput>>;
