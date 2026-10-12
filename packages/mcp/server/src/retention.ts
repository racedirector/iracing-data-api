/**
 * Shared account-level resource accounting for gateway and cursor families.
 *
 * Manifest/chunk/snapshot/replay bytes and opaque tokens reserve against the same
 * caps. Pruners release expired or generation-invalid state before admission; each
 * owner must release exactly its own reservation on removal. Per-family limits
 * alone would allow collections and searches together to exceed the account bound.
 * Request signals are not retained here. Restart discards all in-memory retention.
 */
import { ApplicationFailure } from "./diagnostics/errors.js";

/** One gateway owner shares these caps across manifests, chunks and model cursors. */
export class RetentionBudget {
  readonly #pruners = new Set<() => void>();
  registerPruner(prune: () => void): void {
    this.#pruners.add(prune);
  }
  #bytes = 0;
  #tokens = 0;
  reserve(bytes: number, tokens = 0): void {
    for (const prune of this.#pruners) {
      prune();
    }

    if (this.#bytes + bytes > 32 * 1024 * 1024 || this.#tokens + tokens > 32) {
      throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
    }

    this.#bytes += bytes;
    this.#tokens += tokens;
  }
  release(bytes: number, tokens = 0): void {
    this.#bytes -= bytes;
    this.#tokens -= tokens;
  }
}
