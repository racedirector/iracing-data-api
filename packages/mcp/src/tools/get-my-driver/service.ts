import type { Driver } from "./schema.js";

/**
 * Transport-independent operations required by get_my_driver.
 * The host chooses the principal and supplies an implementation per request.
 */
export interface DriverQueries {
  getCurrent(options: { signal: AbortSignal }): Promise<Driver>;
}
