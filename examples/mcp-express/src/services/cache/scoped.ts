import type { CacheStore } from "./store";

function qualifyKey(namespace: string, key: string) {
  if (key.trim().length === 0) {
    throw new Error("Cache key must not be empty.");
  }

  return `iracing-data:${namespace}:${key}`;
}

export interface CreateScopedCacheResolverOptions {
  cache: CacheStore;
  scope: string;
}

/**
 * Namespace logical keys using an explicit stable scope supplied by composition.
 * Encodes the scope as one URI component; values, expiry and options pass through.
 * Rejects blank scopes. This adapter provides namespacing only, without authentication or access control.
 */
export function createScopedCacheResolver({
  cache,
  scope,
}: CreateScopedCacheResolverOptions): CacheStore {
  if (scope.trim().length === 0) {
    throw new Error("Cache scope must not be empty");
  }

  const encodedScope = encodeURIComponent(scope);

  function scopedKey(key: string) {
    return qualifyKey(encodedScope, key);
  }

  return {
    get(key, options) {
      return cache.get(scopedKey(key), options);
    },
    set(key, value, expiresAt, options) {
      return cache.set(scopedKey(key), value, expiresAt, options);
    },
  };
}
