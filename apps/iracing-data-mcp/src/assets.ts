import { z } from "zod";
import type { FileBackedResolver } from "./resources.js";

/** Asset metadata is a map keyed by numeric iRacing IDs, not an array. */
export const AssetCatalogSchema = z.record(
  z.string().regex(/^[0-9]+$/),
  z.looseObject({}),
);

export type AssetCatalog = z.output<typeof AssetCatalogSchema>;

export interface AssetCatalogResolver {
  all(): Promise<AssetCatalog>;
  refresh(): Promise<AssetCatalog>;
}

/** Cache the latest successful snapshot in memory; refresh it explicitly. */
export function createAssetCatalogResolver(
  source: FileBackedResolver<AssetCatalog>,
): AssetCatalogResolver {
  let current: Promise<AssetCatalog> | undefined;
  let refreshing: Promise<AssetCatalog> | undefined;

  function all(): Promise<AssetCatalog> {
    if (!current) {
      const load = source();
      current = load.catch((error: unknown) => {
        if (current === recovered) {
          current = undefined;
        }

        throw error;
      });
      const recovered = current;
    }

    return current;
  }

  function refresh(): Promise<AssetCatalog> {
    if (!refreshing) {
      const next = source.refresh().then((assets) => {
        current = Promise.resolve(assets);
        return assets;
      });
      refreshing = next;
      void next.then(
        () => { if (refreshing === next) refreshing = undefined; },
        () => { if (refreshing === next) refreshing = undefined; },
      );
    }

    return refreshing;
  }

  return { all, refresh };
}
