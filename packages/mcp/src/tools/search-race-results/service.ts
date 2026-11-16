import type { RaceSearchInput, RaceSearchOutput } from "./schema.js";

/** Request-local historical session search, independent of any concrete client. */
export interface RaceSearchQueries {
  /**
   * Retrieve one validated chunk for the supplied search criteria.
   * @param {RaceSearchInput} input - Explicit participant, source, scope and chunk selection.
   * @param {{ signal: AbortSignal }} context - Request cancellation propagated to all upstream calls.
   * @param {AbortSignal} context.signal - Request cancellation propagated to upstream requests.
   * @returns {Promise<RaceSearchOutput>} Projected sessions and query-scoped coverage.
   */
  search(
    input: RaceSearchInput,
    context: { signal: AbortSignal },
  ): Promise<RaceSearchOutput>;
}
