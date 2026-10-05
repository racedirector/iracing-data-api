import {
  GetCarResponseSchema,
  GetTrackResponseSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "../diagnostics/errors.js";
import { parse } from "../gateway/parsers.js";
import { CollectionCursors, completeResult } from "./collections.js";
import {
  SelfInput,
  DriversInput,
  RecentInput,
  ContentInput,
  SeriesSeasonsInput,
  SeriesScheduleInput,
  DriverProjection,
  CarProjection,
  TrackProjection,
  RecentProjection,
  SeriesSeasonProjection,
  SeriesScheduleProjection,
  Id,
} from "./contracts.js";
import type { DataApiGateway, GatewayCall } from "../gateway/gateway.js";
import type { McpServices } from "../services.js";
import type {
  McpServer,
  StandardSchemaWithJSON,
} from "@modelcontextprotocol/server";

const owners = new WeakMap<DataApiGateway, CollectionCursors>();

function cursors(gateway: DataApiGateway) {
  let owner = owners.get(gateway);

  if (!owner) {
    owner = new CollectionCursors();
    owners.set(gateway, owner);
  }

  return owner;
}

// Keep the precise advertised schema, but run validation inside our safe error
// boundary. SDK default validation includes rejected values in unstructured text.
function safeBoundary(schema: z.ZodType): StandardSchemaWithJSON {
  const json = { ...z.toJSONSchema(schema, { io: "input" }), type: "object" };

  return {
    "~standard": {
      version: 1,
      vendor: "iracing-data-mcp",
      validate: (value) => ({ value }),
      jsonSchema: { input: () => json, output: () => json },
    },
  };
}

export function registerIdentityContentTools(
  server: McpServer,
  services: McpServices,
): void {
  function register<T>(
    name: string,
    description: string,
    schema: z.ZodType<T>,
    work: (
      input: T,
      call: GatewayCall,
      gateway: DataApiGateway,
    ) => Promise<ReturnType<typeof completeResult>>,
  ) {
    server.registerTool(
      name,
      {
        description,
        inputSchema: safeBoundary(schema),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      async (input, ctx) => {
        const context = createRequestContext();

        try {
          const checked = schema.safeParse(input);

          if (!checked.success) {
            throw new ApplicationFailure("INVALID_INPUT");
          }

          const gateway = services.dataApiGateway;

          if (!gateway) {
            throw new ApplicationFailure("CONFIGURATION_ERROR");
          }

          try {
            return await gateway.withCall(
              (call) => work(checked.data, call, gateway),
              ctx.mcpReq.signal,
            );
          } catch (error) {
            // Auth loss and gateway invalidation retire projected state too. A
            // quarantined single-owner service cannot hot-replace an account.
            if (services.authorizationState?.() !== "ready") {
              owners.get(gateway)?.invalidate();
            }

            throw error;
          }
        } catch (error) {
          return toolError(error, context);
        }
      },
    );
  }

  register(
    "get_my_driver",
    "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
    SelfInput,
    async (_input, call) =>
      completeResult(parse(DriverProjection, await call.member())),
  );
  register(
    "find_drivers",
    "Find drivers by a name or ID query. Preserves upstream ranking; multiple matches are ambiguous and never automatically selected. Continue with cursor alone.",
    DriversInput,
    async (input, call, gateway) => {
      const owner = cursors(gateway);

      if ("cursor" in input) {
        return owner.resume("find_drivers", input.cursor, gateway.generation);
      }

      const rows = parse(
        z.array(DriverProjection),
        await call.drivers({
          search_term: input.query,
          ...(input.league_id === undefined
            ? {}
            : { league_id: input.league_id }),
        }),
      );

      return owner.start({
        tool: "find_drivers",
        filters: { query: input.query, league_id: input.league_id },
        generation: gateway.generation,
        items: rows,
        limit: input.limit,
        expiresAt: call.expiresAt,
        context: { ambiguous: rows.length > 1 },
      });
    },
  );
  register(
    "get_recent_races",
    "Return at most ten entries from the upstream recent-race window, in upstream order. Not exhaustive history. Positions retain upstream indexing; requires iracing.auth.",
    RecentInput,
    async (input, call) => {
      const source = await call.recent(
        input.cust_id === undefined ? {} : { cust_id: input.cust_id },
      );

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
  register(
    "lookup_content",
    "Browse cars or tracks, resolve up to 50 unique IDs, or filter names/configuration with a case-insensitive substring. IDs and query are exclusive. Sorted by ID; continue with cursor alone. No assets or prices.",
    ContentInput,
    async (input, call, gateway) => {
      const owner = cursors(gateway);

      if ("cursor" in input) {
        return owner.resume("lookup_content", input.cursor, gateway.generation);
      }

      const source =
        input.kind === "cars" ? await call.cars() : await call.tracks();

      // Current canonical collection schemas validate wire IDs; app schemas own
      // the deliberately smaller agent-facing fields (without raw passthrough).
      if (input.kind === "cars") {
        parse(GetCarResponseSchema, source);
      } else {
        parse(GetTrackResponseSchema, source);
      }

      const rows: Record<string, unknown>[] =
        input.kind === "cars"
          ? parse(z.array(CarProjection), source)
          : parse(z.array(TrackProjection), source);

      const key = input.kind === "cars" ? "car_id" : "track_id";

      const ids = rows.map((row) => row[key] as number);

      if (new Set(ids).size !== ids.length) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      const selected = rows
        .filter((row) =>
          input.ids
            ? input.ids.includes(row[key] as number)
            : input.query
              ? [
                  row.car_name,
                  row.car_name_abbreviated,
                  row.track_name,
                  row.config_name,
                ].some(
                  (value) =>
                    typeof value === "string" &&
                    value.toLowerCase().includes(input.query!.toLowerCase()),
                )
              : true,
        )
        .sort((a, b) => (a[key] as number) - (b[key] as number));

      return owner.start({
        tool: "lookup_content",
        filters: {
          kind: input.kind,
          ids: input.ids?.slice().sort((a, b) => a - b),
          query: input.query?.toLowerCase(),
        },
        generation: gateway.generation,
        items: selected,
        limit: input.limit,
        expiresAt: call.expiresAt,
        context: {
          kind: input.kind,
          ...(input.ids
            ? {
                missing_ids: input.ids
                  .filter((id) => !ids.includes(id))
                  .sort((a, b) => a - b),
              }
            : {}),
        },
      });
    },
  );
  register(
    "list_series_seasons",
    "List active series seasons by default, or a historical year/quarter pair. Optionally filter one positive series ID locally. Results are ordered by season ID; continue with cursor alone.",
    SeriesSeasonsInput,
    async (input, call, gateway) => {
      const owner = cursors(gateway);

      if ("cursor" in input) {
        return owner.resume(
          "list_series_seasons",
          input.cursor,
          gateway.generation,
        );
      }

      const source = await call.seasons({
        include_series: false,
        ...(input.season_year === undefined
          ? {}
          : {
              season_year: input.season_year,
              season_quarter: input.season_quarter,
            }),
      });

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
        generation: gateway.generation,
        items: selected,
        limit: input.limit,
        expiresAt: call.expiresAt,
      });
    },
  );
  register(
    "get_series_schedule",
    "Get one season schedule. race_week_num is the upstream zero-based race week (0 is the first week). Optional week filtering is local; results are deterministically ordered. Continue with cursor alone. No weather, assets, duration or recurrence interpretation.",
    SeriesScheduleInput,
    async (input, call, gateway) => {
      const owner = cursors(gateway);

      if ("cursor" in input) {
        return owner.resume(
          "get_series_schedule",
          input.cursor,
          gateway.generation,
        );
      }

      const source = await call.schedule({ season_id: input.season_id });

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
            a.series_id - b.series_id ||
            a.track.track_id - b.track.track_id ||
            a.track.config_name?.localeCompare(b.track.config_name ?? "") ||
            0,
        );

      return owner.start({
        tool: "get_series_schedule",
        filters: {
          season_id: input.season_id,
          race_week_num: input.race_week_num,
        },
        generation: gateway.generation,
        items: selected,
        limit: input.limit,
        expiresAt: call.expiresAt,
        context: { season_id },
      });
    },
  );
}
