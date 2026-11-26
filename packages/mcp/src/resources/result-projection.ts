/**
 * Bounded, deterministic projection of a validated `/results/get` document.
 *
 * The canonical document is stored by the host; this module owns the small,
 * allowlisted representation that may cross the MCP resource boundary. Protocol
 * facts (session ordering, the main event at simsession_number 0, 0-based
 * positions and zero-based class positions) are projected unchanged. Concrete
 * event shape stays generic: non-main sessions are index-only and never assume a
 * fixed tree, names or type values.
 *
 * The projection is not an MCP contents envelope and never replaces the stored
 * document. Callers must pass a validated {@link RaceResultPayload}; the final
 * projection is re-validated so a resolver cannot smuggle non-allowlisted fields.
 */
import { z } from "zod";
import { ApplicationFailure } from "../diagnostics/errors.js";
import type {
  RaceResultEntryPayload,
  RaceResultPayload,
  RaceResultSimsessionPayload,
} from "@iracing-data/api-schema";

/** Version of the bounded projection shape. */
export const RACE_RESULT_PROJECTION_VERSION = 1;

/** Maximum UTF-8 bytes of a serialized projection. */
export const RACE_RESULT_RESOURCE_BYTE_LIMIT = 65_536;

/** Upstream path represented by the canonical document. */
export const RACE_RESULT_SOURCE_PATH = "/data/results/get";

/** Host-measured provenance attached to a stored result. */
export interface RaceResultProvenance {
  /** Epoch milliseconds when the document was fetched. */
  readonly fetchedAt: number;

  /** Epoch milliseconds after which upstream revalidation is required. */
  readonly revalidateAfter: number;

  /** Canonical content hash, `sha256:<64 lowercase hex>`. */
  readonly contentHash: string;
}

const positiveId = z.int().positive().max(Number.MAX_SAFE_INTEGER);

const nonnegativeInt = z.int().nonnegative();

type ValueShape = Record<string, z.ZodType>;

/**
 * Build a permissive decoder for a strict projection shape.
 *
 * The payload schema is loose, so an optional upstream field may arrive as null
 * or the wrong type. Decoding invalid values to absent keeps the rest of a valid
 * document projectable, and `z.object` strips unknown keys. The strict output
 * schema is still applied to the finished projection.
 */
function permissiveObject(
  shape: ValueShape,
): z.ZodType<Record<string, unknown>> {
  const permissive: ValueShape = {};

  for (const [key, schema] of Object.entries(shape)) {
    permissive[key] = schema.optional().catch(undefined);
  }

  return z.object(permissive).transform((value) => {
    const result: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        result[key] = entry;
      }
    }

    return result;
  });
}

const trackValueShape = {
  track_id: positiveId.optional(),
  track_name: z.string().optional(),
  config_name: z.string().optional(),
} satisfies ValueShape;

const TrackInputSchema = permissiveObject(trackValueShape);

const TrackProjectionSchema = z.strictObject(trackValueShape);

const distanceValueShape = {
  event_laps_complete: z.number().optional(),
  race_summary_laps_complete: z.number().optional(),
} satisfies ValueShape;

const DistanceInputSchema = permissiveObject(distanceValueShape);

const CompletedDistanceSchema = z.strictObject(distanceValueShape);

const eventValueShape = {
  event_type: z.int(),
  event_type_name: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  official_session: z.boolean().optional(),
  series_id: nonnegativeInt.optional(),
  series_name: z.string().optional(),
  season_id: nonnegativeInt.optional(),
  season_name: z.string().optional(),
  race_week_num: nonnegativeInt.optional(),
  num_drivers: z.int().optional(),
  event_average_lap: z.number().optional(),
  event_best_lap_time: z.number().optional(),
  event_strength_of_field: z.number().optional(),
  num_lead_changes: z.int().optional(),
  num_cautions: z.int().optional(),
  num_caution_laps: z.int().optional(),
  results_restricted: z.boolean().optional(),
  restrict_results: z.boolean().optional(),
  heat_info_id: z.int().optional(),
  league_id: nonnegativeInt.optional(),
  league_name: z.string().optional(),
  league_season_id: nonnegativeInt.optional(),
  league_season_name: z.string().optional(),
  host_id: nonnegativeInt.optional(),
  session_name: z.string().optional(),
} satisfies ValueShape;

const EventInputSchema = permissiveObject(eventValueShape);

const EventProjectionSchema = z.strictObject({
  ...eventValueShape,
  track: TrackProjectionSchema.optional(),
  completed_distance: CompletedDistanceSchema.optional(),
});

const sessionValueShape = {
  simsession_name: z.string().optional(),
  simsession_type: z.int().optional(),
  simsession_type_name: z.string().optional(),
  simsession_subtype: z.int().optional(),
} satisfies ValueShape;

const SessionInputSchema = permissiveObject(sessionValueShape);

const SessionIndexSchema = z.strictObject({
  simsession_number: z.int(),
  ...sessionValueShape,
  is_main_event: z.boolean(),
  entry_count: nonnegativeInt,
  driver_count: nonnegativeInt,
  class_count: nonnegativeInt,
});

const driverValueShape = {
  cust_id: positiveId.optional(),
  team_id: z.int().optional(),
  display_name: z.string().optional(),
} satisfies ValueShape;

const DriverInputSchema = permissiveObject(driverValueShape);

const NestedDriverProjectionSchema = z.strictObject({
  cust_id: positiveId,
  team_id: z.int().optional(),
  display_name: z.string().optional(),
});

const entryValueShape = {
  cust_id: positiveId.optional(),
  team_id: z.int().optional(),
  display_name: z.string().optional(),
  ai: z.boolean().optional(),
  finish_position: z.int().optional(),
  position: z.int().optional(),
  finish_position_in_class: z.int().optional(),
  starting_position: z.int().optional(),
  starting_position_in_class: z.int().optional(),
  car_class_id: z.int().optional(),
  car_class_name: z.string().optional(),
  car_class_short_name: z.string().optional(),
  car_id: z.int().optional(),
  car_name: z.string().optional(),
  reason_out: z.string().optional(),
  reason_out_id: z.int().optional(),
  laps_complete: z.int().optional(),
  laps_lead: z.int().optional(),
  opt_laps_complete: z.int().optional(),
  incidents: z.int().optional(),
  interval: z.int().optional(),
  class_interval: z.int().optional(),
  average_lap: z.number().optional(),
  best_lap_num: z.int().optional(),
  best_lap_time: z.number().optional(),
  qual_lap_time: z.number().optional(),
  champ_points: z.number().optional(),
  aggregate_champ_points: z.number().optional(),
  league_points: z.number().optional(),
  league_agg_points: z.number().optional(),
  drop_race: z.boolean().optional(),
  division: z.int().optional(),
  division_name: z.string().optional(),
} satisfies ValueShape;

const EntryInputSchema = permissiveObject(entryValueShape);

const EntryProjectionSchema = z
  .strictObject({
    attribution: z.enum(["team", "individual"]),
    ...entryValueShape,
    drivers: z.array(NestedDriverProjectionSchema).optional(),
  })
  .meta({
    description:
      "Allowlisted participant row. Team rows nest identity-only drivers; positions and status remain upstream values.",
  });

const classValueShape = {
  car_class_id: z.int().optional(),
  car_class_name: z.string().optional(),
  car_class_short_name: z.string().optional(),
} satisfies ValueShape;

const ClassInputSchema = permissiveObject(classValueShape);

const ClassSummarySchema = z.strictObject({
  ...classValueShape,
  entry_count: nonnegativeInt,
  driver_count: nonnegativeInt,
});

const mainEventBaseShape = {
  simsession_number: z.literal(0),
  ...sessionValueShape,
  is_main_event: z.literal(true),
  entry_count: nonnegativeInt,
  driver_count: nonnegativeInt,
  class_count: nonnegativeInt,
} as const;

const MainEventProjectionSchema = z.strictObject({
  ...mainEventBaseShape,
  results: z.array(EntryProjectionSchema),
});

const MainEventSummarySchema = z.strictObject({
  ...mainEventBaseShape,
  main_event_results_omitted: z.literal(true),
  class_summaries: z.array(ClassSummarySchema),
});

const provenanceShape = {
  projection_version: z.literal(RACE_RESULT_PROJECTION_VERSION),
  source_path: z.literal(RACE_RESULT_SOURCE_PATH),
  subsession_id: positiveId,
  fetched_at: nonnegativeInt,
  revalidate_after: nonnegativeInt,
  content_hash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
} as const;

const sharedShape = {
  ...provenanceShape,
  event: EventProjectionSchema,
  sessions: z.array(SessionIndexSchema),
} as const;

/** Complete bounded projection for a result that fits the byte cap. */
export const RaceResultProjectionSchema = z.strictObject({
  ...sharedShape,
  oversized: z.literal(false),
  main_event: MainEventProjectionSchema,
});

/** Explicit bounded summary when the complete projection would exceed the cap. */
export const RaceResultSummaryProjectionSchema = z.strictObject({
  ...sharedShape,
  oversized: z.literal(true),
  limit_bytes: z.literal(RACE_RESULT_RESOURCE_BYTE_LIMIT),
  full_projection_bytes: nonnegativeInt,
  oversized_reason: z.literal("main_event_projection_exceeds_cap"),
  main_event: MainEventSummarySchema,
});

/** Normal or oversized-summary projection union. */
export const RaceResultProjectionUnionSchema = z.discriminatedUnion(
  "oversized",
  [RaceResultProjectionSchema, RaceResultSummaryProjectionSchema],
);

export type RaceResultProjection = z.infer<typeof RaceResultProjectionSchema>;
export type RaceResultSummaryProjection = z.infer<
  typeof RaceResultSummaryProjectionSchema
>;
export type RaceResultProjectionUnion = z.infer<
  typeof RaceResultProjectionUnionSchema
>;

/** A projection plus its exact compact serialization and byte count. */
export interface SerializedRaceResultProjection {
  /** Validated projection value. */
  readonly projection: RaceResultProjectionUnion;

  /** Exact compact JSON text returned to the client. */
  readonly json: string;

  /** UTF-8 byte count of {@link json}. */
  readonly bytes: number;
}

/**
 * Measure the UTF-8 byte length of text.
 *
 * @param {string} text - Text to measure.
 * @returns {number} Byte length of the UTF-8 encoding.
 */
export function measureUtf8Bytes(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function defined(values: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(values)) {
    if (values[key] !== undefined) {
      result[key] = values[key];
    }
  }

  return result;
}

function nestedDrivers(entry: RaceResultEntryPayload): unknown[] {
  const value = (entry as Record<string, unknown>).driver_results;

  return Array.isArray(value) ? value : [];
}

function addParticipantIds(
  entry: RaceResultEntryPayload,
  ids: Set<number>,
): void {
  const row = entry as Record<string, unknown>;

  if (typeof row.cust_id === "number" && row.cust_id > 0) {
    ids.add(row.cust_id);
  }

  for (const driver of nestedDrivers(entry)) {
    if (
      isRecord(driver) &&
      typeof driver.cust_id === "number" &&
      driver.cust_id > 0
    ) {
      ids.add(driver.cust_id);
    }
  }
}

function participantIds(session: RaceResultSimsessionPayload): Set<number> {
  const ids = new Set<number>();

  for (const entry of session.results) {
    addParticipantIds(entry, ids);
  }

  return ids;
}

function classCount(session: RaceResultSimsessionPayload): number {
  const classes = new Set<number>();

  for (const entry of session.results) {
    const value = (entry as Record<string, unknown>).car_class_id;

    if (typeof value === "number") {
      classes.add(value);
    }
  }

  return classes.size;
}

function projectEntry(entry: RaceResultEntryPayload): Record<string, unknown> {
  const row = entry as Record<string, unknown>;

  const drivers = nestedDrivers(entry);

  const teamId = typeof row.team_id === "number" ? row.team_id : undefined;

  const attribution =
    teamId !== undefined && drivers.length > 0 ? "team" : "individual";

  const projected: Record<string, unknown> = {
    attribution,
    ...EntryInputSchema.parse(row),
  };

  if (attribution === "team") {
    projected.drivers = drivers.flatMap((driver) => {
      const parsed = DriverInputSchema.safeParse(
        isRecord(driver) ? driver : {},
      );

      return parsed.success && parsed.data.cust_id !== undefined
        ? [parsed.data]
        : [];
    });
  }

  return projected;
}

function sessionMetadata(session: RaceResultSimsessionPayload) {
  return SessionInputSchema.parse(session);
}

function projectSessionIndex(session: RaceResultSimsessionPayload) {
  return defined({
    simsession_number: session.simsession_number,
    ...sessionMetadata(session),
    is_main_event: session.simsession_number === 0,
    entry_count: session.results.length,
    driver_count: participantIds(session).size,
    class_count: classCount(session),
  });
}

function projectEvent(document: RaceResultPayload): Record<string, unknown> {
  const source = document as Record<string, unknown>;

  const event = EventInputSchema.parse(source);

  if (isRecord(source.track)) {
    const track = TrackInputSchema.parse(source.track);

    if (Object.keys(track).length > 0) {
      event.track = track;
    }
  }

  const raceSummary = isRecord(source.race_summary)
    ? source.race_summary
    : undefined;

  const completedDistance = DistanceInputSchema.parse({
    event_laps_complete: source.event_laps_complete,
    race_summary_laps_complete: raceSummary?.laps_complete,
  });

  if (Object.keys(completedDistance).length > 0) {
    event.completed_distance = completedDistance;
  }

  return event;
}

function classSummaries(session: RaceResultSimsessionPayload) {
  const groups = new Map<number | undefined, unknown[]>();

  for (const entry of session.results) {
    const value = (entry as Record<string, unknown>).car_class_id;

    const key = typeof value === "number" ? value : undefined;

    const group = groups.get(key);

    if (group) {
      group.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }

  return [...groups.entries()].map(([carClassId, entries]) => {
    const first = entries[0] as Record<string, unknown>;

    const ids = new Set<number>();

    for (const entry of entries) {
      addParticipantIds(entry as RaceResultEntryPayload, ids);
    }

    return {
      ...ClassInputSchema.parse({
        car_class_id: carClassId,
        car_class_name: first.car_class_name,
        car_class_short_name: first.car_class_short_name,
      }),
      entry_count: entries.length,
      driver_count: ids.size,
    };
  });
}

function mainEvent(document: RaceResultPayload): RaceResultSimsessionPayload {
  const main = document.session_results.find(
    (session) => session.simsession_number === 0,
  );

  if (!main) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  return main;
}

function sharedProjection(
  document: RaceResultPayload,
  provenance: RaceResultProvenance,
) {
  return {
    projection_version: RACE_RESULT_PROJECTION_VERSION,
    source_path: RACE_RESULT_SOURCE_PATH,
    subsession_id: document.subsession_id,
    fetched_at: provenance.fetchedAt,
    revalidate_after: provenance.revalidateAfter,
    content_hash: provenance.contentHash,
    event: projectEvent(document),
    sessions: document.session_results.map(projectSessionIndex),
  };
}

function buildNormal(
  document: RaceResultPayload,
  provenance: RaceResultProvenance,
) {
  const main = mainEvent(document);

  return {
    ...sharedProjection(document, provenance),
    oversized: false,
    main_event: defined({
      simsession_number: 0,
      ...sessionMetadata(main),
      is_main_event: true,
      entry_count: main.results.length,
      driver_count: participantIds(main).size,
      class_count: classCount(main),
      results: main.results.map(projectEntry),
    }),
  };
}

function buildSummary(
  document: RaceResultPayload,
  provenance: RaceResultProvenance,
  fullProjectionBytes: number,
) {
  const main = mainEvent(document);

  return {
    ...sharedProjection(document, provenance),
    oversized: true,
    limit_bytes: RACE_RESULT_RESOURCE_BYTE_LIMIT,
    full_projection_bytes: fullProjectionBytes,
    oversized_reason: "main_event_projection_exceeds_cap",
    main_event: defined({
      simsession_number: 0,
      ...sessionMetadata(main),
      is_main_event: true,
      entry_count: main.results.length,
      driver_count: participantIds(main).size,
      class_count: classCount(main),
      main_event_results_omitted: true,
      class_summaries: classSummaries(main),
    }),
  };
}

function serialize(projection: RaceResultProjectionUnion) {
  const json = JSON.stringify(projection);

  return { json, bytes: measureUtf8Bytes(json) };
}

/**
 * Project a validated result document into the bounded resource representation.
 *
 * Builds the complete main-event projection first. If it exceeds the UTF-8 cap,
 * returns the explicit summary variant instead of truncating rows. If even the
 * summary exceeds the cap, the projection fails with `RESPONSE_LIMIT_EXCEEDED`.
 *
 * @param {RaceResultPayload} document - Validated downloaded result document.
 * @param {RaceResultProvenance} provenance - Host-measured freshness and hash data.
 * @returns {SerializedRaceResultProjection} Validated projection and exact JSON text.
 * @throws {ApplicationFailure} When even the summary exceeds the byte cap.
 */
export function createRaceResultProjection(
  document: RaceResultPayload,
  provenance: RaceResultProvenance,
): SerializedRaceResultProjection {
  const normalCandidate = buildNormal(document, provenance);

  const normal = RaceResultProjectionSchema.parse(normalCandidate);

  const normalSerialized = serialize(normal);

  if (normalSerialized.bytes <= RACE_RESULT_RESOURCE_BYTE_LIMIT) {
    return { projection: normal, ...normalSerialized };
  }

  const summary = RaceResultSummaryProjectionSchema.parse(
    buildSummary(document, provenance, normalSerialized.bytes),
  );

  const summarySerialized = serialize(summary);

  if (summarySerialized.bytes > RACE_RESULT_RESOURCE_BYTE_LIMIT) {
    throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
  }

  return { projection: summary, ...summarySerialized };
}

/**
 * Validate an already-materialized projection and enforce the byte cap.
 *
 * Hosts may cache the projection JSON; this guard prevents a resolver from
 * returning extra fields or an over-limit response.
 *
 * @param {unknown} value - Candidate projection value.
 * @returns {SerializedRaceResultProjection} Validated projection and compact JSON.
 * @throws {ApplicationFailure} When the projection is invalid or over the cap.
 */
export function validateRaceResultProjection(
  value: unknown,
): SerializedRaceResultProjection {
  const projection = RaceResultProjectionUnionSchema.parse(value);

  const json = JSON.stringify(projection);

  const bytes = measureUtf8Bytes(json);

  if (bytes > RACE_RESULT_RESOURCE_BYTE_LIMIT) {
    throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
  }

  return { projection, json, bytes };
}
