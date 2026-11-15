import type { RecentRaceWindow } from "./schema.js";

/** Required domain capability. Consumers decide which client/data source serves it. */
export interface RecentRaceQueries {
  getRecent(options: {
    custId?: number;
    signal: AbortSignal;
  }): Promise<RecentRaceWindow>;
}
