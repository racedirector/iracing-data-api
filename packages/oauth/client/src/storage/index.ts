/**
 * Adapter result that permits storage implementations to be synchronous or promise-like
 * without changing caller semantics.
 */
export type Awaitable<V> = V | PromiseLike<V>;

/** Supported storage-key domain for generic injected stores. */
export type Key = string | number;

/**
 * Stored-value domain that reserves undefined for a missing entry while still allowing null as
 * intentional data.
 */
export type Value = object | string | number | boolean | symbol | bigint | null;

/**
 * Read controls shared by injected stores; abort signals allow callers to cancel storage work
 * cooperatively.
 */
export interface GetOptions {
  /** Cooperatively cancels a read when supported by the injected store. */
  signal?: AbortSignal;
}

/**
 * Minimal storage abstraction used by OAuth state/session owners, with optional bulk clearing
 * for implementations that can support it safely.
 */
export interface SimpleStore<K extends Key = string, V extends Value = Value> {
  /**
   * Reads one stored entry, reserving undefined for an absent key.
   * @param {K} key - Storage identity whose entry should be loaded.
   * @param {GetOptions} options - Optional cooperative cancellation controls for this read.
   * @returns {Awaitable<undefined | V>} Stored data, or undefined for an absent key, synchronously or through a promise-like result.
   */
  get: (key: K, options?: GetOptions) => Awaitable<undefined | V>;

  /**
   * Replaces the entry at one storage identity.
   * @param {K} key - Storage identity to create or replace.
   * @param {V} value - Payload to retain; undefined is reserved for missing entries.
   * @returns {Awaitable<void>} Completion of the write, synchronously or through a promise-like result.
   */
  set: (key: K, value: V) => Awaitable<void>;

  /**
   * Removes the entry associated with one storage identity.
   * @param {K} key - Storage identity whose entry should be removed.
   * @returns {Awaitable<void>} Completion of removal, synchronously or through a promise-like result.
   */
  del: (key: K) => Awaitable<void>;

  /**
   * Removes all entries when bulk clearing is supported by the implementation.
   * @returns {Awaitable<void>} Completion of clearing, synchronously or through a promise-like result.
   */
  clear?: () => Awaitable<void>;
}

export * from "./memory-store";
export * from "./disk-store";
export * from "./token-document-store";
