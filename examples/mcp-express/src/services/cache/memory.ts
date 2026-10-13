import type { CacheStore } from "./store";

export interface CreateMemoryCacheStoreOptions {
  now?: () => number;
}

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export function createMemoryCacheStore({
  now = Date.now,
}: CreateMemoryCacheStoreOptions = {}): CacheStore {
  const entries = new Map<string, CacheEntry>();

  return {
    async get(key, options) {
      options?.signal?.throwIfAborted();

      const entry = entries.get(key);

      if (!entry) {
        return undefined;
      }

      if (entry.expiresAt <= now()) {
        entries.delete(key);

        return undefined;
      }

      options?.signal?.throwIfAborted();

      return entry.value;
    },

    async set(key, value, expiresAt, options) {
      options?.signal?.throwIfAborted();

      if (expiresAt <= now()) {
        entries.delete(key);

        return;
      }

      entries.set(key, {
        value,
        expiresAt,
      });

      options?.signal?.throwIfAborted();
    },
  };
}
