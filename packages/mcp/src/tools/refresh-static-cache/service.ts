import type { RefreshInput } from "./schema.js";

/** Host-owned replacement of one static snapshot and its live index. */
export interface StaticCacheRefresh {
  /**
   * Refresh one dataset, retaining last-good data on failure.
   * @param {RefreshInput["dataset"]} dataset - Explicit static dataset selector.
   * @param {{ signal: AbortSignal }} options - Caller cancellation.
   * @param {AbortSignal} options.signal - Cancellation before starting replacement.
   * @returns {Promise<number | null>} Replacement entry count, or null when unavailable.
   */
  refresh(
    dataset: RefreshInput["dataset"],
    options: { signal: AbortSignal },
  ): Promise<number | null>;
}
