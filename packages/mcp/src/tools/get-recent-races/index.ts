import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "../../diagnostics/errors.js";
import { toolInputSchema } from "../../input.js";
import { completeResult } from "../../result.js";
import {
  RecentInput,
  RecentRaceWindowSchema,
  RecentOutputSchema,
} from "./schema.js";
import type {
  IracingToolContext,
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register a bounded recent-races query using an injected domain capability.
 * @param {IracingToolRegistry} server - MCP registry that receives the tool definition.
 * @param {IracingToolServices} services - Host-provided selectors for request-local capabilities.
 */
export function registerGetRecentRaces(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  server.registerTool(
    "get_recent_races",
    {
      description:
        "Return at most ten entries from the upstream recent-race window, in upstream order. Not exhaustive history. Positions retain upstream indexing; requires iracing.auth.",
      inputSchema: toolInputSchema(RecentInput),
      outputSchema: RecentOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    (input, request) =>
      handleGetRecentRaces(input, services, {
        signal: request.mcpReq.signal,
        authInfo: request.http?.authInfo,
      }),
  );
}

/** Keep service selection, bounds, output projection and failures visible. */
async function handleGetRecentRaces(
  input: unknown,
  services: IracingToolServices,
  context: IracingToolContext,
) {
  try {
    const checked = RecentInput.safeParse(input);

    if (!checked.success) {
      throw new ApplicationFailure("INVALID_INPUT");
    }

    context.signal.throwIfAborted();
    if (!services.getRecentRaceQueries) {
      throw new ApplicationFailure("CONFIGURATION_ERROR");
    }

    const queries = await services.getRecentRaceQueries(context);

    const window = await queries.getRecent({
      custId: checked.data.cust_id,
      signal: context.signal,
    });

    context.signal.throwIfAborted();
    const resolved = RecentRaceWindowSchema.safeParse(window);

    if (!resolved.success) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    if (
      checked.data.cust_id !== undefined &&
      resolved.data.cust_id !== checked.data.cust_id
    ) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    const races = resolved.data.races.slice(0, checked.data.limit);

    const output = RecentOutputSchema.parse({
      cust_id: resolved.data.cust_id,
      races,
      returned_count: races.length,
      complete: true,
      position_basis: "upstream",
    });

    return completeResult(output);
  } catch (error) {
    return toolError(
      context.signal.aborted
        ? new ApplicationFailure("UPSTREAM_UNAVAILABLE")
        : error,
      createRequestContext(),
    );
  }
}
