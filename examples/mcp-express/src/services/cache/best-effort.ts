import type { CacheStore } from "./store";
import type { AppLogger } from "../../logger";

export interface CreateBestEffortCacheResolverOptions {
  cache: CacheStore;
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
}: CreateBestEffortCacheResolverOptions): CacheStore {
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
