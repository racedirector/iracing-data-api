import { ApplicationFailure } from "./diagnostics/errors.js";

/** A scope shares memory/token caps across retained collection and search pages. */
export class RetentionBudget {
  readonly #pruners = new Set<() => void>();

  /**
   * Registers a cleanup callback invoked before reserving retained response capacity.
   * @param {() => void} prune - Cleanup callback that releases expired retained state.
   */
  registerPruner(prune: () => void): void {
    this.#pruners.add(prune);
  }
  #bytes = 0;
  #tokens = 0;

  /**
   * Prunes expired state and reserves bytes and cursor tokens within process limits.
   * @param {number} bytes - Number of retained bytes to reserve or release.
   * @param {number} tokens - Number of retained cursor tokens to reserve or release.
   * @throws {ApplicationFailure} If the byte or cursor-token capacity would be exceeded.
   */
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

  /**
   * Returns previously reserved bytes and cursor tokens to the shared budget.
   * @param {number} bytes - Number of retained bytes to reserve or release.
   * @param {number} tokens - Number of retained cursor tokens to reserve or release.
   */
  release(bytes: number, tokens = 0): void {
    this.#bytes -= bytes;
    this.#tokens -= tokens;
  }
}
