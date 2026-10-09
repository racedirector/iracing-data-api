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
  private state = new Map<K, V>();

  constructor(entries?: Iterable<readonly [K, V]>) {
    if (entries) {
      for (const entry of entries) {
        this.state.set(...entry);
      }
    }
  }

  get(key: K, _options?: GetOptions) {
    return this.state.get(key);
  }

  set(key: K, value: V) {
    this.state.set(key, value);
  }

  del(key: K) {
    this.state.delete(key);
  }

  clear() {
    this.state.clear();
  }
}
