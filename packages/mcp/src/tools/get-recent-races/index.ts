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
import type { Result } from "../types.js";
import type { z } from "zod";

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
        title: "Get recent races",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, request) => {
      const context = {
        signal: request.mcpReq.signal,
        authInfo: request.http?.authInfo,
      };

      try {
        const result = await handleGetRecentRaces(input, services, context);

        if (!result.ok) {
          throw new ApplicationFailure(result.error);
        }

        return completeResult(result.data);
      } catch (error) {
        return toolError(
          context.signal.aborted
            ? new ApplicationFailure("UPSTREAM_UNAVAILABLE")
            : error,
          createRequestContext(),
        );
      }
    },
  );
}

/** Keep service selection, bounds, output projection and failures visible. */
async function handleGetRecentRaces(
  input: unknown,
  services: IracingToolServices,
  context: IracingToolContext,
): Promise<
  Result<
    z.infer<typeof RecentOutputSchema>,
    "INVALID_INPUT" | "CONFIGURATION_ERROR" | "DATA_RESOLUTION_FAILED"
  >
> {
  const checked = RecentInput.safeParse(input);

  if (!checked.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  context.signal.throwIfAborted();
  if (!services.getRecentRaceQueries) {
    return { ok: false, error: "CONFIGURATION_ERROR" };
  }

  const queries = await services.getRecentRaceQueries(context);

  const window = await queries.getRecent({
    custId: checked.data.cust_id,
    signal: context.signal,
  });

  context.signal.throwIfAborted();
  const resolved = RecentRaceWindowSchema.safeParse(window);

  if (!resolved.success) {
    return { ok: false, error: "DATA_RESOLUTION_FAILED" };
  }

  if (
    checked.data.cust_id !== undefined &&
    resolved.data.cust_id !== checked.data.cust_id
  ) {
    return { ok: false, error: "DATA_RESOLUTION_FAILED" };
  }

  const races = resolved.data.races.slice(0, checked.data.limit);

  return {
    ok: true,
    data: RecentOutputSchema.parse({
      cust_id: resolved.data.cust_id,
      races,
      returned_count: races.length,
      complete: true,
      position_basis: "upstream",
    }),
  };
}
