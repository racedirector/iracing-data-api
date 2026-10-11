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
export type Value = NonNullable<unknown> | null;

/**
 * Read controls shared by injected stores; abort signals allow callers to cancel storage work
 * cooperatively.
 */
export type GetOptions = { signal?: AbortSignal };

/**
 * Minimal storage abstraction used by OAuth state/session owners, with optional bulk clearing
 * for implementations that can support it safely.
 */
export interface SimpleStore<K extends Key = string, V extends Value = Value> {
  /**
   * @return undefined if the key is not in the store (which is why Value cannot contain "undefined").
   */
  get: (key: K, options?: GetOptions) => Awaitable<undefined | V>;
  set: (key: K, value: V) => Awaitable<void>;
  del: (key: K) => Awaitable<void>;
  clear?: () => Awaitable<void>;
}

export * from "./memory-store";
export * from "./disk-store";
export * from "./token-document-store";
