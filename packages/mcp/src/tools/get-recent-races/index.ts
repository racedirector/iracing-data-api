import { registerApplicationTool } from "../../execution.js";
import { handleGetRecentRaces } from "./operation.js";
import { RecentInput, RecentOutputSchema } from "./schema.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register recent races with explicit request-local capability selection.
 * @param {IracingToolRegistry} server - MCP registry that receives the tool definition.
 * @param {IracingToolServices} services - Host-provided selectors for request-local capabilities.
 */
export function registerGetRecentRaces(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerApplicationTool(server, services, {
    name: "get_recent_races",
    description:
      "Return at most ten entries from the upstream recent-race window, in upstream order. Not exhaustive history. Positions retain upstream indexing; requires iracing.auth.",
    inputSchema: RecentInput,
    outputSchema: RecentOutputSchema,
    annotations: {
      title: "Get recent races",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async execute(input, context) {
      const queries = await context.services.getRecentRaceQueries(context);

      return handleGetRecentRaces(input, queries, context);
    },
  });
}
