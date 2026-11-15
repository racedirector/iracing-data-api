import { registerGetMyDriver } from "./tools/get-my-driver/index.js";
import { registerGetRecentRaces } from "./tools/get-recent-races/index.js";
import type { IracingToolRegistry, IracingToolServices } from "./services.js";

/** Register the two explicit, dependency-injected iRacing tools. */
export function registerIracingTools(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerGetMyDriver(server, services);
  registerGetRecentRaces(server, services);
}
