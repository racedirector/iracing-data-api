import { randomBytes } from "node:crypto";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { RetentionBudget } from "../retention.js";

/** Immutable cursor-count, retention-byte, response-byte, and lifetime limits. */
export const COLLECTION_LIMITS = Object.freeze({
  cursors: 32,
  bytes: 32 * 1024 * 1024,
  resultBytes: 64 * 1024,
  ttlMs: 300_000,
});

/**
 * Raises the stable cursor-expiration protocol failure used for expired or evicted collection
 * state.
 * @throws {ApplicationFailure} Always, to report an expired or evicted continuation.
 */
export function collectionExpired(): never {
  throw new ApplicationFailure("CURSOR_EXPIRED", {
    reason: "expired_or_evicted",
  });
}

function capacity(): never {
  throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
}

/**
 * Builds a successful MCP tool result with the original value as structuredContent and a JSON
 * text serialization that may omit unsupported values. Both projections are jointly constrained
 * by the response-size policy.
 * @param {Record<string, unknown>} value - Input value to validate, store, or serialize.
 * @returns {{ content: { type: "text"; text: string; }[]; structuredContent: Record<string, unknown>; }} MCP text and structured-content projections within the response-size limit.
 */
export function completeResult(value: Record<string, unknown>) {
  const result = {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
    structuredContent: value,
  };

  if (
    Buffer.byteLength(JSON.stringify(result)) > COLLECTION_LIMITS.resultBytes
  ) {
    capacity();
  }

  return result;
}

type Result = ReturnType<typeof completeResult>;
interface Snapshot {
  readonly tool: string;
  readonly filters: string;
  readonly items: readonly Record<string, unknown>[];
  readonly context: Record<string, unknown>;
  readonly limit: number;
  readonly expiresAt: number;
  readonly bytes: number;
}
interface Cursor {
  readonly snapshot: Snapshot;
  readonly offset: number;
  result?: Result;
  resultBytes?: number;
}

/** One process/account owner. Only projected collections are retained; no raw URLs or tokens. */
export class CollectionCursors {
  readonly #entries = new Map<string, Cursor>();
  readonly #now: () => number;

  /**
   * Register expiry cleanup with the shared budget; now returns Unix milliseconds.
   * @param {() => number} now - Clock returning Unix milliseconds for cursor expiration.
   * @param {RetentionBudget} budget - Shared owner of retained bytes and cursor-token capacity.
   */
  constructor(
    now: () => number = Date.now,
    readonly budget = new RetentionBudget(),
  ) {
    this.#now = now;
    budget.registerPruner(() => {
      this.#prune();
    });
  }

  /** Discards all retained cursors and releases their capacity reservations. */
  invalidate(): void {
    this.budget.release(this.#bytes(), this.#entries.size);
    this.#entries.clear();
  }

  /** Remove expired cursors and release their snapshot, replay, and token reservations. */
  #prune() {
    const before = this.#bytes(),
      tokens = this.#entries.size;

    for (const [token, entry] of this.#entries) {
      if (entry.snapshot.expiresAt <= this.#now()) {
        this.#entries.delete(token);
      }
    }

    this.budget.release(before - this.#bytes(), tokens - this.#entries.size);
  }
  #bytes() {
    const snapshots = new Set<Snapshot>();

    let bytes = 0;

    for (const entry of this.#entries.values()) {
      if (!snapshots.has(entry.snapshot)) {
        snapshots.add(entry.snapshot);
        bytes += entry.snapshot.bytes;
      }

      bytes += entry.resultBytes ?? 0;
    }

    return bytes;
  }

  /**
   * Clone a collection and return its first page, retaining continuation state as needed.
   * ExpiresAt is in Unix milliseconds and is capped at five minutes from now.
   * Limit must be an integer from 1 to 100; pages may shrink to fit 64 KiB.
   * Source_total counts all supplied items. Expired state throws CURSOR_EXPIRED;
   * invalid limits or exhausted capacity throw RESPONSE_LIMIT_EXCEEDED.
   * Cloning and JSON serialization errors propagate.
   * @param {{ tool: string; filters: unknown; items: readonly Record<string, unknown>[]; context?: Record<string, unknown>; limit: number; expiresAt: number; }} options - Configuration and injected capabilities for this operation.
   * @param {string} options.tool - Tool identifier bound to every retained continuation.
   * @param {unknown} options.filters - Initial selection bound to continuation replay validation.
   * @param {readonly Record<string, unknown>[]} options.items - Projected records copied into the retained snapshot.
   * @param {Record<string, unknown>} options.context - Additional metadata included in each page.
   * @param {number} options.limit - Maximum records per page, from 1 to 100.
   * @param {number} options.expiresAt - Upstream expiration deadline in Unix milliseconds.
   * @returns {Result} First bounded page and its optional continuation cursor.
   */
  start(options: {
    tool: string;
    filters: unknown;
    items: readonly Record<string, unknown>[];
    context?: Record<string, unknown>;
    limit: number;
    expiresAt: number;
  }): Result {
    this.#prune();
    const expiresAt = Math.min(
      options.expiresAt,
      this.#now() + COLLECTION_LIMITS.ttlMs,
    );

    if (expiresAt <= this.#now()) {
      collectionExpired();
    }

    if (
      !Number.isInteger(options.limit) ||
      options.limit < 1 ||
      options.limit > 100
    ) {
      capacity();
    }

    // Clone before retention: caller mutation cannot change any future page.
    const items = structuredClone(options.items),
      context = structuredClone(options.context ?? {});

    const filters = JSON.stringify(options.filters);

    const snapshot: Snapshot = {
      ...options,
      items,
      context,
      filters,
      expiresAt,
      bytes: Buffer.byteLength(
        JSON.stringify({
          tool: options.tool,
          limit: options.limit,
          expiresAt,
          items,
          context,
          filters,
        }),
      ),
    };

    return this.#page(snapshot, 0);
  }

  /**
   * Return a cloned page for this owner's tool-bound token, caching successful replay.
   * Unknown, expired, or wrong-tool tokens throw CURSOR_EXPIRED. Page or retention
   * capacity failures propagate as RESPONSE_LIMIT_EXCEEDED without advancing the token.
   * @param {string} tool - Tool identifier that must match the retained continuation.
   * @param {string} token - Opaque continuation identifying retained state for this owner.
   * @returns {Result} First bounded page and its optional continuation cursor.
   */
  resume(tool: string, token: string): Result {
    this.#prune();
    const entry = this.#entries.get(token);

    if (entry?.snapshot.tool !== tool) {
      collectionExpired();
    }

    if (entry.result) {
      return structuredClone(entry.result);
    }

    const result = this.#page(entry.snapshot, entry.offset, entry);

    return structuredClone(result);
  }

  #boundedPage(snapshot: Snapshot, offset: number, token: string) {
    let count = Math.min(snapshot.limit, snapshot.items.length - offset);

    let result: Result;

    for (;;) {
      const complete = offset + count === snapshot.items.length;

      const value = {
        ...snapshot.context,
        items: snapshot.items.slice(offset, offset + count),
        returned_count: count,
        complete,
        next_cursor: complete ? null : token,
        source_total: snapshot.items.length,
      };

      try {
        result = completeResult(value);
        break;
      } catch (error) {
        if (!(error instanceof ApplicationFailure) || count <= 1) {
          throw error;
        }

        count--;
      }
    }

    return { count, result };
  }

  #additionalBytes(snapshot: Snapshot, more: boolean, resultBytes: number) {
    const retained = [...this.#entries.values()].some(
      (entry) => entry.snapshot === snapshot,
    );

    return (!retained && more ? snapshot.bytes : 0) + resultBytes;
  }

  /**
   * Build a page from a zero-based item offset, shrinking it to the response byte cap.
   * Reserve continuation/replay capacity before publication; capacity and expiry
   * failures propagate without publishing a new token or cached replay result.
   */
  #page(snapshot: Snapshot, offset: number, current?: Cursor): Result {
    let token: string;

    do {
      token = randomBytes(32).toString("base64url");
    } while (this.#entries.has(token));

    const { count, result } = this.#boundedPage(snapshot, offset, token);

    const more = offset + count < snapshot.items.length;

    const resultBytes = current ? Buffer.byteLength(JSON.stringify(result)) : 0;

    const additional = this.#additionalBytes(snapshot, more, resultBytes);

    if (
      (more && this.#entries.size >= COLLECTION_LIMITS.cursors) ||
      this.#bytes() + additional > COLLECTION_LIMITS.bytes
    ) {
      capacity();
    }

    this.budget.reserve(additional, more ? 1 : 0);
    if (snapshot.expiresAt <= this.#now()) {
      this.budget.release(additional, more ? 1 : 0);
      collectionExpired();
    }

    // All checks precede publication: replay is synchronous and idempotent.
    if (more) {
      this.#entries.set(token, { snapshot, offset: offset + count });
    }

    if (current) {
      current.result = structuredClone(result);
      current.resultBytes = resultBytes;
    }

    return structuredClone(result);
  }
}
