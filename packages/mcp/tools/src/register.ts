import { registerFindDrivers } from "./tools/find-drivers.js";
import { registerGetMyDriver } from "./tools/get-my-driver.js";
import { registerGetRaceResult } from "./tools/get-race-result.js";
import { registerGetRecentRaces } from "./tools/get-recent-races.js";
import { registerGetSeriesSchedule } from "./tools/get-series-schedule.js";
import { registerListSeriesSeasons } from "./tools/list-series-seasons.js";
import { registerLookupContent } from "./tools/lookup-content.js";
import { registerSearchDriverRaces } from "./tools/search-driver-races.js";
import type { IracingToolRegistry, IracingToolServices } from "./services.js";

/** Register the eight iRacing tools without configuring or creating the server. */
export function registerIracingTools(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerGetMyDriver(server, services);
  registerFindDrivers(server, services);
  registerGetRecentRaces(server, services);
  registerLookupContent(server, services);
  registerListSeriesSeasons(server, services);
  registerGetSeriesSchedule(server, services);
  registerGetRaceResult(server, services);
  registerSearchDriverRaces(server, services);
}
