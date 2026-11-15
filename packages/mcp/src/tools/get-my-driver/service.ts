import type { Driver } from "./schema.js";

/**
 * Transport-independent operations required by get_my_driver.
 * The host chooses the principal and supplies an implementation per request.
 */
export interface DriverQueries {
  /**
   * Load the authenticated driver without leaking other profile fields.
   * @param {{signal: AbortSignal}} options - Context for the current driver lookup.
   * @param {AbortSignal} options.signal - Cancellation for the upstream request.
   * @returns {Promise<Driver>} Public current-driver identity.
   */
  getCurrent(options: { signal: AbortSignal }): Promise<Driver>;
}
