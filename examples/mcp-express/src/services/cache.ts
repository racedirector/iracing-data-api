import type { AppLogger } from "../logger";
import type { CacheResolver } from "../mcp/tools/resolvers/cache";

export interface CreateBestEffortCacheResolverOptions {
  cache: CacheResolver;
  logger: AppLogger;
}

/**
 * Convert backend failures into misses or no-ops while preserving cancellation.
 * Logs omit keys and raw errors, which may contain principal or backend secrets.
 * Can be wrapped by createScopedCacheResolver before being supplied to tools.
 */
export function createBestEffortCacheResolver({
  cache,
  logger,
}: CreateBestEffortCacheResolverOptions): CacheResolver {
  return {
    async get(key, options) {
      options?.signal?.throwIfAborted();

      try {
        const value = await cache.get(key, options);

        options?.signal?.throwIfAborted();

        return value;
      } catch (error) {
        options?.signal?.throwIfAborted();
        logger.warn("Cache operation failed", {
          operation: "get",
          error: error instanceof Error ? "Error" : typeof error,
        });

        return undefined;
      }
    },
    async set(key, value, expiresAt, options) {
      options?.signal?.throwIfAborted();
      try {
        await cache.set(key, value, expiresAt, options);
        options?.signal?.throwIfAborted();
      } catch (error) {
        options?.signal?.throwIfAborted();
        logger.warn("Cache operation failed", {
          operation: "set",
          error: error instanceof Error ? "Error" : typeof error,
        });
      }
    },
  };
}

export interface CreateScopedCacheResolverOptions {
  cache: CacheResolver;
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
}: CreateScopedCacheResolverOptions): CacheResolver {
  if (scope.trim().length === 0) {
    throw new Error("Cache scope must not be empty");
  }

  const encodedScope = encodeURIComponent(scope);

  function scopedKey(key: string) {
    return `iracing-data:${encodedScope}:${key}`;
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
