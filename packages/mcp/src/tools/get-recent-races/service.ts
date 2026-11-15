import type { RecentRaceWindow } from "./schema.js";

/** Required domain capability. Consumers decide which client/data source serves it. */
export interface RecentRaceQueries {
  /**
   * Load the upstream recent-race window for the selected customer.
   * @param {{custId?: number; signal: AbortSignal}} options - Customer selector and cancellation.
   * @param {number} [options.custId] - Customer ID, defaulting to the authenticated account.
   * @param {AbortSignal} options.signal - Cancellation for the upstream request.
   * @returns {Promise<RecentRaceWindow>} Bounded recent race records from the selected provider.
   */
  getRecent(options: {
    custId?: number;
    signal: AbortSignal;
  }): Promise<RecentRaceWindow>;
}
