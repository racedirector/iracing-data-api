import { z } from "zod";

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
  source: (() => Promise<AssetCatalog>) & {
    refresh(): Promise<AssetCatalog>;
  },
): AssetCatalogResolver {
  let current: Promise<AssetCatalog> | undefined;
  let refreshing: Promise<AssetCatalog> | undefined;

  function all(): Promise<AssetCatalog> {
    if (!current) {
      const load = source();
      current = load;
      void load.catch(() => {
        if (current === load) {
          current = undefined;
        }
      });
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
