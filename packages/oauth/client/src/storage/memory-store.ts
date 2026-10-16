/**
 * Process-local generic map for state/session injection and offline fixtures.
 *
 * Values are kept by reference until mutation or process loss; there is no durable
 * publication, expiry enforcement, token validation or cross-owner coordination.
 * OAuthClient owns state consumption and same-instance refresh single-flight. This
 * store does not provide an external lock or security boundary by implementing the
 * same interface as durable stores.
 */
import type { GetOptions, Key, SimpleStore, Value } from "./index";

/**
 * A minimal in-memory implementation of the {@link SimpleStore} interface for
 * quickly wiring up local state and session storage.
 */
export class InMemoryStore<
  K extends Key = string,
  V extends Value = Value,
> implements SimpleStore<K, V> {
  private readonly state = new Map<K, V>();

  /**
   * Seeds an in-memory key-value store from optional initial entries.
   * @param {Iterable<readonly [K, V]>} entries - Initial key-value entries copied into the store.
   */
  constructor(entries?: Iterable<readonly [K, V]>) {
    if (entries) {
      for (const entry of entries) {
        this.state.set(...entry);
      }
    }
  }

  /**
   * Reads the value associated with a key without creating a missing entry.
   * @param {K} key - Identifier of the stored value to read or mutate.
   * @param {GetOptions} _options - Optional cooperative read controls supported by the store interface.
   * @returns {V | undefined} Stored value, or undefined when no entry exists.
   */
  get(key: K, _options?: GetOptions) {
    return this.state.get(key);
  }

  /**
   * Stores the supplied value under its key.
   * @param {K} key - Identifier of the stored value to read or mutate.
   * @param {V} value - Input value to validate, store, or serialize.
   */
  set(key: K, value: V) {
    this.state.set(key, value);
  }

  /**
   * Deletes the stored value associated with a key.
   * @param {K} key - Identifier of the stored value to read or mutate.
   */
  del(key: K) {
    this.state.delete(key);
  }

  /** Removes all values owned by this store. */
  clear() {
    this.state.clear();
  }
}
