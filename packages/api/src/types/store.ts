export type Awaitable<V> = V | PromiseLike<V>;
export type Key = NonNullable<unknown>;
export type Value = NonNullable<unknown> | null;

export type GetOptions = { signal?: AbortSignal };

export interface Store<K extends Key, V extends Value> {
  get: (key: K, options?: GetOptions) => Awaitable<V | undefined>;
  set: (key: K, value: V) => Awaitable<void>;
  del: (key: K) => Awaitable<void>;
  clear?: () => Awaitable<void>;
}
