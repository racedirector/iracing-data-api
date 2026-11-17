import { registerApplicationTool } from "../../execution.js";
import { handleSearchRaceResults } from "./operation.js";
import { SearchInput, SearchOutput } from "./schema.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register historical search with typed execution and request-local services.
 * @param {IracingToolRegistry} server - Caller-owned registration surface.
 * @param {IracingToolServices} services - Host-provided capability selectors.
 */
export function registerSearchRaceResults(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerApplicationTool(server, services, {
    name: "search_race_results",
    description:
      "Search series or hosted results (including league races) for any driver/team or explicit criteria. No implicit current driver or race-only filter. Supply a series season or UTC time range of at most 90 days. If an end is omitted, its begin must be less than 90 days old and not in the future. Use explicit begin/end pairs for older history and split multi-year requests into separate windows; each start/finish range is validated independently. team_id overrides cust_id upstream. Returns one zero-based upstream chunk, in upstream order; query_complete covers only this query. Repeat with chunk_index to retrieve other chunks; searches are rerun and are not a stable snapshot. Narrow criteria on RESPONSE_LIMIT_EXCEEDED. No special-event classification or name lookup; requires iracing.auth.",
    inputSchema: SearchInput,
    outputSchema: SearchOutput,
    annotations: {
      title: "Search race results",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async execute(input, context) {
      const queries = await context.services.getRaceSearchQueries(context);

      return handleSearchRaceResults(input, queries, {
        signal: context.signal,
      });
    },
  });
}
