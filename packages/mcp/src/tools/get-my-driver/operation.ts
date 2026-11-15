import type { OperationContext, Result } from "../types.js";
import type { Driver } from "./schema.js";
import type { DriverQueries } from "./service.js";

/**
 * Load the selected account's identity without protocol presentation concerns.
 * @param {DriverQueries} queries - Host-selected driver capability.
 * @param {OperationContext} context - Request cancellation.
 * @returns {Promise<Result<Driver, never>>} Identity for final schema projection.
 */
export async function handleGetMyDriver(
  queries: DriverQueries,
  context: OperationContext,
): Promise<Result<Driver, never>> {
  context.signal.throwIfAborted();

  return {
    ok: true,
    data: await queries.getCurrent({ signal: context.signal }),
  };
}
