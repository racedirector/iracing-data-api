import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "../../diagnostics/errors.js";
import { toolInputSchema } from "../../input.js";
import { completeResult } from "../../result.js";
import { SearchInput, SearchOutput } from "./schema.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register historical search with explicit validation and request-local services.
 * @param {IracingToolRegistry} server - Caller-owned registration surface.
 * @param {IracingToolServices} services - Request-local domain capability selectors.
 */
export function registerSearchRaceResults(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  server.registerTool(
    "search_race_results",
    {
      description:
        "Search series or hosted results (including league races) for any driver/team or explicit criteria. No implicit current driver or race-only filter. Supply a season or UTC time range. team_id overrides cust_id upstream. Returns one zero-based upstream chunk, in upstream order; query_complete covers only this query. Repeat with chunk_index to retrieve other chunks; searches are rerun and are not a stable snapshot. Narrow criteria on RESPONSE_LIMIT_EXCEEDED. No special-event classification or name lookup; requires iracing.auth.",
      inputSchema: toolInputSchema(SearchInput),
      outputSchema: SearchOutput,
      annotations: {
        title: "Search race results",
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
        const checked = SearchInput.safeParse(input);

        if (!checked.success) {
          throw new ApplicationFailure("INVALID_INPUT");
        }

        context.signal.throwIfAborted();
        if (!services.getRaceSearchQueries) {
          throw new ApplicationFailure("CONFIGURATION_ERROR");
        }

        const queries = await services.getRaceSearchQueries(context);

        const result = await queries.search(checked.data, context);
        context.signal.throwIfAborted();
        const output = SearchOutput.safeParse(result);

        if (!output.success) {
          throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
        }

        if (
          output.data.source !== checked.data.source ||
          output.data.chunk_index !== checked.data.chunk_index ||
          output.data.returned_count !== output.data.results.length ||
          output.data.query_complete !==
            (output.data.returned_count === output.data.total_matches)
        ) {
          throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
        }

        return completeResult(output.data);
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
