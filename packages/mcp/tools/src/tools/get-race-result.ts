import { ResultsApi } from "@iracing-data/api-client-fetch";
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
  optionalId,
  optionalInteger,
  optionalNumber,
  position,
} from "./primitives.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";
function projectRaceParticipants(
  source: readonly Record<string, unknown>[],
  custIds?: readonly number[],
): Record<string, unknown>[] {
  return source.flatMap((raw) => {
    const participant = parse(RaceParticipantProjection, raw);

    const team = participant.team_id !== null;

    if (team && custIds) {
      // Nested rows carry driver-specific data only. Never inherit team totals.
      const drivers =
        parse(
          z.array(z.record(z.string(), z.unknown())).nullish(),
          raw.driver_results,
        ) ?? [];

      return drivers
        .map((driver) => {
          const projected = parse(RaceParticipantProjection, {
            ...driver,
            team_id: participant.team_id,
          });

          if (projected.cust_id === null) {
            throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
          }

          return { ...projected, attribution: "team" };
        })
        .filter(
          (driver) =>
            driver.cust_id !== null && custIds.includes(driver.cust_id),
        );
    }

    if (
      custIds &&
      (participant.cust_id === null || !custIds.includes(participant.cust_id))
    ) {
      return [];
    }

    return [{ ...participant, attribution: team ? "team" : "driver" }];
  });
}

/**
 * Register get_race_result on the caller-owned server.
 * @param {IracingToolRegistry} server - Caller-owned MCP tool registration capability.
 * @param {IracingToolServices} services - Host-owned API access and continuation services.
 */
export function registerGetRaceResult(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition);
}

/** Accepts race identifiers and participant filters or an opaque continuation. */
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

/** Projects race identity, timing, series, and track context with normalized optional fields. */
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

/** Validates session identity and raw participant rows before local projection. */
export const RaceSessionProjection = z.object({
  simsession_number: z.number().int(),
  results: z.array(z.record(z.string(), z.unknown())),
});

/** Projects participant identity, classification, positions, and lap statistics. */
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

function outputSchema() {
  return pageOutput(
    z.object({
      cust_id: Id.nullable(),
      team_id: Id.nullable(),
      display_name: z.string(),
      car_id: Id.nullable(),
      car_class_id: Id.nullable(),
      starting_position: z.number().int().nullable(),
      finish_position: z.number().int().nullable(),
      finish_position_in_class: z.number().int().nullable(),
      laps_complete: z.number().int().nullable(),
      incidents: z.number().int().nullable(),
      champ_points: z.number().nullable(),
      oldi_rating: z.number().int().nullable(),
      newi_rating: z.number().int().nullable(),
      reason_out: z.string().nullable(),
      attribution: z.enum(["team", "driver"]),
    }),
    {
      subsession_id: Id,
      start_time: z.iso.datetime({ offset: true }).nullable(),
      series_id: Id.nullable(),
      series_name: z.string().nullable(),
      season_id: Id.nullable(),
      track: z.object({
        track_id: Id,
        track_name: z.string().nullable(),
        config_name: z.string().nullable(),
      }),
      simsession_number: z.number().int(),
      position_basis: z.literal("one_based"),
    },
  );
}

const definition = {
  name: "get_race_result",
  description:
    "Get bounded participants from one subsession and simsession (default 0). Positions are one-based; negative sentinels are null. Customer filters select nested team drivers with explicit team attribution, never individual standings from team totals. Empty matches do not establish participation. Preserves source order; continue with cursor alone. Requires iracing.auth.",
  inputSchema: RaceResultInput,
  outputSchema: outputSchema(),
  work: async (input, access, context) => {
    const owner = continuation(access.continuationScope).collections;

    if ("cursor" in input) {
      return owner.resume("get_race_result", input.cursor);
    }

    const resolved = await materialize(
      await new ResultsApi(access.configuration).getResults(
        {
          subsession_id: input.subsession_id,
          include_licenses: false,
        },
        { signal: context.signal },
      ),
      z
        .object({
          session_results: z.array(z.record(z.string(), z.unknown())),
        })
        .loose(),
      context.signal,
      access.configuration.fetchApi,
    );

    const source = resolved.data;

    const raceContext = parse(RaceContextProjection, source);

    if (raceContext.subsession_id !== input.subsession_id) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    const sessions = parse(
      z.array(RaceSessionProjection),
      source.session_results,
    );

    if (
      new Set(sessions.map((row) => row.simsession_number)).size !==
      sessions.length
    ) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    const session = sessions.find(
      (row) => row.simsession_number === input.simsession_number,
    );

    if (!session) {
      throw new ApplicationFailure("NOT_FOUND");
    }

    const rows = projectRaceParticipants(session.results, input.cust_ids);

    return owner.start({
      tool: "get_race_result",
      filters: input,
      items: rows,
      limit: input.limit,
      expiresAt: resolved.expiresAt,
      context: {
        ...raceContext,
        simsession_number: input.simsession_number,
        position_basis: "one_based",
      },
    });
  },
} satisfies ToolDefinition<z.infer<typeof RaceResultInput>>;
