import { registerFindReference } from "./tools/find-reference/index.js";
import { registerGetMyDriver } from "./tools/get-my-driver/index.js";
import { registerGetRecentRaces } from "./tools/get-recent-races/index.js";
import { registerStaticCacheRefresh } from "./tools/refresh-static-cache/index.js";
import { registerSearchRaceResults } from "./tools/search-race-results/index.js";
import type { IracingToolRegistry, IracingToolServices } from "./services.js";

/**
 * Register explicit, dependency-injected iRacing tools.
 * @param {IracingToolRegistry} server - Caller-owned MCP tool registration surface.
 * @param {IracingToolServices} services - Domain capability selectors resolved per request.
 * @throws {TypeError} If any required selector is missing.
 */
export function registerIracingTools(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  if (
    typeof services.getDriverQueries !== "function" ||
    typeof services.getRecentRaceQueries !== "function" ||
    typeof services.getRaceSearchQueries !== "function" ||
    (services.getReferenceQueries !== undefined &&
      typeof services.getReferenceQueries !== "function") ||
    (services.getStaticCacheRefresh !== undefined &&
      typeof services.getStaticCacheRefresh !== "function")
  ) {
    throw new TypeError("All iRacing capability selectors are required.");
  }

  registerGetMyDriver(server, services);
  registerGetRecentRaces(server, services);
  registerSearchRaceResults(server, services);
  if (services.getReferenceQueries) {
    registerFindReference(server, services);
  }

  if (services.getStaticCacheRefresh) {
    registerStaticCacheRefresh(server, services);
  }
}
