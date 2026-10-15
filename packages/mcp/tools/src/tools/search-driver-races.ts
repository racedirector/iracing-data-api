import { z } from "zod";
import { registerTool, pageOutput } from "../execution.js";
import { Id } from "./primitives.js";
import { SearchInput } from "./search-driver-races/contracts.js";
import { searchCursors } from "./search-driver-races/cursor.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";

/** Register search_driver_races on the caller-owned server. */
export function registerSearchDriverRaces(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition);
}

const definition = {
  name: "search_driver_races",
  description:
    "Search one driver's race session summaries within an explicit start-inclusive/end-exclusive UTC range of at most 90 days, or a season year/quarter. Requires iracing.auth. Source order is subsession_id (a time proxy). track_ids filters locally, scanning at most four chunks per page; an empty incomplete page is valid. Continue with cursor alone. Summaries do not establish individual outcomes; use get_race_result for selected details and report incomplete coverage.",
  inputSchema: SearchInput,
  outputSchema: pageOutput(
    z.object({
      subsession_id: Id,
      start_time: z.iso.datetime({ offset: true }),
      end_time: z.iso.datetime({ offset: true }).nullable(),
      season_id: Id.nullable(),
      series_id: Id.nullable(),
      series_name: z.string().nullable(),
      track: z.object({
        track_id: Id,
        track_name: z.string().nullable(),
        config_name: z.string().nullable(),
      }),
      event_type: z.number().int(),
      num_drivers: z.number().int().nullable(),
      official_session: z.boolean().nullable(),
    }),
    {
      cust_id: Id,
      filters: z.record(z.string(), z.unknown()),
      order: z.literal("subsession_id"),
    },
  ),
  work: async (input, access, context) => {
    const owner = searchCursors(access.continuationScope);

    return "cursor" in input
      ? owner.resume(input.cursor, access, context.signal)
      : owner.start(input, access, context.signal);
  },
} satisfies ToolDefinition<z.infer<typeof SearchInput>>;
