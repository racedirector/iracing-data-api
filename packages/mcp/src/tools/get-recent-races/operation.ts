import { RecentRaceWindowSchema } from "./schema.js";
import type { FailureFor } from "../../diagnostics/errors.js";
import type { OperationContext, Result } from "../types.js";
import type { RecentInput, RecentOutputSchema } from "./schema.js";
import type { RecentRaceQueries } from "./service.js";
import type { z } from "zod";

/**
 * Validate the source window, enforce identity and retain bounded upstream order.
 * @param {z.output<typeof RecentInput>} input - Already validated customer and limit.
 * @param {RecentRaceQueries} queries - Host-selected recent-race capability.
 * @param {OperationContext} context - Request cancellation and correlation.
 * @returns {Promise<Result<z.input<typeof RecentOutputSchema>, FailureFor<"DATA_RESOLUTION_FAILED">>>} Bounded window or a typed data failure.
 */
export async function handleGetRecentRaces(
  input: z.output<typeof RecentInput>,
  queries: RecentRaceQueries,
  context: OperationContext,
): Promise<
  Result<
    z.input<typeof RecentOutputSchema>,
    FailureFor<"DATA_RESOLUTION_FAILED">
  >
> {
  context.signal.throwIfAborted();
  const window = await queries.getRecent({
    custId: input.cust_id,
    signal: context.signal,
  });

  context.signal.throwIfAborted();
  const resolved = RecentRaceWindowSchema.safeParse(window);

  if (!resolved.success) {
    return { ok: false, error: { code: "DATA_RESOLUTION_FAILED" } };
  }

  if (input.cust_id !== undefined && resolved.data.cust_id !== input.cust_id) {
    return { ok: false, error: { code: "DATA_RESOLUTION_FAILED" } };
  }

  const races = resolved.data.races.slice(0, input.limit);

  return {
    ok: true,
    data: {
      cust_id: resolved.data.cust_id,
      races,
      returned_count: races.length,
      complete: races.length === resolved.data.races.length,
      position_basis: "upstream",
    },
  };
}
