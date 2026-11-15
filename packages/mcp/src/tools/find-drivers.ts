import { LookupApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { continuation } from "../continuation.js";
import { registerTool, pageOutput } from "../execution.js";
import { materialize } from "../linked-response.js";
import { DriverProjection } from "./get-my-driver.js";
import { Id, query, limit, ContinuationInput } from "./primitives.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";

/**
 * Register find_drivers on the caller-owned server.
 * @param {IracingToolRegistry} server - Caller-owned MCP tool registration capability.
 * @param {IracingToolServices} services - Host-owned API access and continuation services.
 */
export function registerFindDrivers(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition);
}

/** Accepts a driver query or an opaque continuation with bounded page size. */
export const DriversInput = z.union([
  z.strictObject({ query, league_id: Id.optional(), limit }),
  ContinuationInput,
]);

const definition = {
  name: "find_drivers",
  description:
    "Find drivers by a name or ID query. Preserves upstream ranking; multiple matches are ambiguous and never automatically selected. Continue with cursor alone.",
  inputSchema: DriversInput,
  outputSchema: pageOutput(DriverProjection, { ambiguous: z.boolean() }),
  work: async (input, access, context) => {
    const owner = continuation(access.continuationScope).collections;

    if ("cursor" in input) {
      return owner.resume("find_drivers", input.cursor);
    }

    const resolved = await materialize(
      await new LookupApi(access.configuration).getLookupDrivers(
        { search_term: input.query, league_id: input.league_id },
        { signal: context.signal },
      ),
      z.array(DriverProjection),
      context.signal,
      access.configuration.fetchApi,
    );

    const rows = resolved.data;

    return owner.start({
      tool: "find_drivers",
      filters: { query: input.query, league_id: input.league_id },
      items: rows,
      limit: input.limit,
      expiresAt: resolved.expiresAt,
      context: { ambiguous: rows.length > 1 },
    });
  },
} satisfies ToolDefinition<z.infer<typeof DriversInput>>;
