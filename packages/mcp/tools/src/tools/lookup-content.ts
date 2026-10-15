import { CarApi, TrackApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { continuation } from "../continuation.js";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { registerTool, pageOutput } from "../execution.js";
import { materialize, parse } from "../linked-response.js";
import {
  Id,
  query,
  limit,
  ContinuationInput,
  text,
  optionalText,
  optionalId,
  optionalBoolean,
} from "./primitives.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";

/** Register lookup_content on the caller-owned server. */
export function registerLookupContent(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition);
}

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

function outputSchema() {
  return pageOutput(
    z.union([
      z.object({
        car_id: Id,
        car_name: z.string(),
        car_name_abbreviated: z.string().nullable(),
      }),
      z.object({
        track_id: Id,
        track_name: z.string(),
        config_name: z.string().nullable(),
        category_id: Id.nullable(),
        is_oval: z.boolean().nullable(),
        is_dirt: z.boolean().nullable(),
      }),
    ]),
    { kind: z.enum(["cars", "tracks"]), missing_ids: z.array(Id).optional() },
  );
}

function missingIds(requested: number[] | undefined, ids: number[]) {
  return requested
    ? {
        missing_ids: requested
          .filter((id) => !ids.includes(id))
          .sort((a, b) => a - b),
      }
    : {};
}

const definition = {
  name: "lookup_content",
  description:
    "Browse cars or tracks, resolve up to 50 unique IDs, or filter names/configuration with a case-insensitive substring. IDs and query are exclusive. Sorted by ID; continue with cursor alone. No assets or prices.",
  inputSchema: ContentInput,
  outputSchema: outputSchema(),
  work: async (input, access, context) => {
    const owner = continuation(access.continuationScope).collections;

    if ("cursor" in input) {
      return owner.resume("lookup_content", input.cursor);
    }

    const resolved = await materialize(
      input.kind === "cars"
        ? await new CarApi(access.configuration).getCar({
            signal: context.signal,
          })
        : await new TrackApi(access.configuration).getTrack({
            signal: context.signal,
          }),
      z.array(z.record(z.string(), z.unknown())),
      context.signal,
      access.configuration.fetchApi,
    );

    const source = resolved.data;

    const rows: Record<string, unknown>[] =
      input.kind === "cars"
        ? parse(z.array(CarProjection), source)
        : parse(z.array(TrackProjection), source);

    const key = input.kind === "cars" ? "car_id" : "track_id";

    const ids = rows.map((row) => row[key] as number);

    if (new Set(ids).size !== ids.length) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    const selected = selectContent(rows, key, input);

    return owner.start({
      tool: "lookup_content",
      filters: {
        kind: input.kind,
        ids: input.ids?.slice().sort((a, b) => a - b),
        query: input.query?.toLowerCase(),
      },
      items: selected,
      limit: input.limit,
      expiresAt: resolved.expiresAt,
      context: {
        kind: input.kind,
        ...missingIds(input.ids, ids),
      },
    });
  },
} satisfies ToolDefinition<z.infer<typeof ContentInput>>;

function selectContent(
  rows: Record<string, unknown>[],
  key: string,
  input: Exclude<z.infer<typeof ContentInput>, { cursor: string }>,
) {
  const query = input.query?.toLowerCase();

  return rows
    .filter((row) => {
      if (input.ids) {
        return input.ids.includes(row[key] as number);
      }

      if (!query) {
        return true;
      }

      return [
        row.car_name,
        row.car_name_abbreviated,
        row.track_name,
        row.config_name,
      ].some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(query),
      );
    })
    .sort((a, b) => (a[key] as number) - (b[key] as number));
}
