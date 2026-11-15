import type { Driver } from "./schema.js";

/**
 * Transport-independent operations required by get_my_driver.
 * The host chooses the principal and supplies an implementation per request.
 */
export interface DriverQueries {
  /**
   * Load the authenticated driver without leaking other profile fields.
   * @param options
   * @param options.signal
   */
  getCurrent(options: { signal: AbortSignal }): Promise<Driver>;
}
