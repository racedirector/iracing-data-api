import type { RecentRaceWindow } from "./schema.js";

/** Required domain capability. Consumers decide which client/data source serves it. */
export interface RecentRaceQueries {
  /** Load the upstream recent-race window for the selected customer. */
  getRecent(options: {
    custId?: number;
    signal: AbortSignal;
  }): Promise<RecentRaceWindow>;
}
