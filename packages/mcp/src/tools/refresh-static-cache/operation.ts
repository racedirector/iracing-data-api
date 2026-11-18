import type { FailureFor } from "../../diagnostics/errors.js";
import type { OperationContext, Result } from "../types.js";
import type { RefreshInput, RefreshOutput } from "./schema.js";
import type { StaticCacheRefresh } from "./service.js";

/**
 * Replace one static dataset through a host-selected capability.
 * @param {StaticCacheRefresh} maintenance - Host-owned snapshot maintenance.
 * @param {RefreshInput} input - Validated dataset selector.
 * @param {OperationContext} context - Caller cancellation.
 * @returns {Promise<Result<RefreshOutput, FailureFor<"NOT_FOUND">>>} Bounded replacement summary.
 */
export async function handleStaticCacheRefresh(
  maintenance: StaticCacheRefresh,
  { dataset }: RefreshInput,
  context: OperationContext,
): Promise<Result<RefreshOutput, FailureFor<"NOT_FOUND">>> {
  context.signal.throwIfAborted();
  const count = await maintenance.refresh(dataset, { signal: context.signal });

  context.signal.throwIfAborted();
  if (count === null) {
    return { ok: false, error: { code: "NOT_FOUND" } };
  }

  const kind = {
    cars: null,
    tracks: null,
    "car-classes": null,
    "car-assets": "cars",
    "track-assets": "tracks",
    "series-assets": "series",
  }[dataset];

  return {
    ok: true,
    data: {
      dataset,
      resource_uri: kind ? `iracing://assets/${kind}` : `iracing://${dataset}`,
      count,
    },
  };
}
