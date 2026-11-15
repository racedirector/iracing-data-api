import { SearchOutput } from "./schema.js";
import type { FailureFor } from "../../diagnostics/errors.js";
import type { OperationContext, Result } from "../types.js";
import type { RaceSearchInput } from "./schema.js";
import type { RaceSearchQueries } from "./service.js";
import type { z } from "zod";

/**
 * Validate query-scoped coverage and project a single requested result chunk.
 * @param {RaceSearchInput} input - Validated historical search criteria.
 * @param {RaceSearchQueries} queries - Actor-owned search capability.
 * @param {OperationContext} context - Request cancellation context.
 * @returns {Promise<Result<z.input<typeof SearchOutput>, FailureFor<"DATA_RESOLUTION_FAILED">>>} Projected search or safe data failure.
 */
export async function handleSearchRaceResults(
  input: z.output<typeof SearchInput>,
  queries: RaceSearchQueries,
  context: OperationContext,
): Promise<
  Result<
    z.input<typeof SearchOutput>,
    FailureFor<"DATA_RESOLUTION_FAILED">
  >
> {
  context.signal.throwIfAborted();
  const result = await queries.search(input, { signal: context.signal });

  context.signal.throwIfAborted();
  const projected = SearchOutput.safeParse(result);

  if (!projected.success) {
    return { ok: false, error: { code: "DATA_RESOLUTION_FAILED" } };
  }

  const data = projected.data;

  if (
    data.source !== input.source ||
    data.chunk_index !== input.chunk_index ||
    data.returned_count !== data.results.length ||
    data.query_complete !== (data.returned_count === data.total_matches) ||
    (data.total_matches === 0) !== (data.total_chunks === 0) ||
    (data.total_chunks > 0 && data.chunk_index >= data.total_chunks)
  ) {
    return { ok: false, error: { code: "DATA_RESOLUTION_FAILED" } };
  }

  return { ok: true, data };
}
