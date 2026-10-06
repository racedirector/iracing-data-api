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
