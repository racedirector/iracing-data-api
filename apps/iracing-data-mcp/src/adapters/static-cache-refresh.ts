import { mapUpstreamFailure } from "./errors.js";
import type { RuntimeCatalogResolver } from "../catalog.js";
import type {
  AssetCatalog,
  ReferenceCatalog,
  StaticCacheRefresh,
} from "@iracing-data/mcp";

type RefreshableCatalog = ReferenceCatalog & {
  readonly resolver: RuntimeCatalogResolver<unknown>;
};

type RefreshableAssetCatalog = AssetCatalog & {
  readonly resolver: RuntimeCatalogResolver<Record<string, unknown>>;
};

/**
 * Adapt the same live resolvers used by resource reads for snapshot maintenance.
 * @param {readonly RefreshableCatalog[]} catalogs - Host-owned reference catalogs.
 * @param {readonly RefreshableAssetCatalog[]} assets - Host-owned asset metadata.
 * @returns {StaticCacheRefresh} Lazy maintenance capability.
 */
export function createStaticCacheRefresh(
  catalogs: readonly RefreshableCatalog[],
  assets: readonly RefreshableAssetCatalog[],
): StaticCacheRefresh {
  return {
    async refresh(dataset, { signal }) {
      signal.throwIfAborted();
      const kind = {
        cars: null,
        tracks: null,
        "car-classes": null,
        "car-assets": "cars",
        "track-assets": "tracks",
        "series-assets": "series",
      }[dataset];

      const catalog = kind
        ? assets.find((item) => item.kind === kind)
        : catalogs.find((item) => item.name === dataset);

      if (!catalog?.resolver.refresh) {
        return null;
      }

      try {
        // Shared persistence must finish even if one caller cancels.
        const entries = await catalog.resolver.refresh();

        return entries.length;
      } catch (error) {
        throw mapUpstreamFailure(error);
      }
    },
  };
}
