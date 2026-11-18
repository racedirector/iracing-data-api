import { ApplicationFailure } from "@iracing-data/mcp";
import type { RefreshInput, RefreshOutput } from "./schema.js";
import type { RefreshableAssetCatalog, RefreshableCatalog } from "./service.js";
import type { z } from "zod";

/**
 * Replace one configured dataset without selecting credentials or transport.
 * @param {z.output<typeof RefreshInput>} input - Validated explicit selector.
 * @param {readonly RefreshableCatalog[]} catalogs - Host-owned live catalogs.
 * @param {readonly RefreshableAssetCatalog[]} assets - Host-owned live assets.
 * @returns {Promise<z.input<typeof RefreshOutput>>} Small replacement summary.
 */
export async function refreshStaticCache(
  { dataset }: z.output<typeof RefreshInput>,
  catalogs: readonly RefreshableCatalog[],
  assets: readonly RefreshableAssetCatalog[],
): Promise<z.input<typeof RefreshOutput>> {
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
    throw new ApplicationFailure("NOT_FOUND");
  }

  const entries = await catalog.resolver.refresh();

  return {
    dataset,
    resource_uri: kind ? `iracing://assets/${kind}` : `iracing://${dataset}`,
    count: entries.length,
  };
}
