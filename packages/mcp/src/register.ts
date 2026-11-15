import { registerGetMyDriver } from "./tools/get-my-driver/index.js";
import { registerGetRecentRaces } from "./tools/get-recent-races/index.js";
import type { IracingToolRegistry, IracingToolServices } from "./services.js";

/**
 * Register the two explicit, dependency-injected iRacing tools.
 * @param {IracingToolRegistry} server - Caller-owned MCP tool registration surface.
 * @param {IracingToolServices} services - Domain capability selectors resolved per request.
 * @throws {TypeError} If either required selector is missing.
 */
export function registerIracingTools(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  if (
    typeof services.getDriverQueries !== "function" ||
    typeof services.getRecentRaceQueries !== "function"
  ) {
    throw new TypeError("Both iRacing capability selectors are required.");
  }

  registerGetMyDriver(server, services);
  registerGetRecentRaces(server, services);
}
