import { INTERNAL_ERROR, ProtocolError } from "@modelcontextprotocol/server";
import { ImageFieldSchema, imageUrl, trackMapUrl } from "./service.js";
import type { AssetCatalog } from "./service.js";

/**
 * Complete positive asset IDs without loading metadata for malformed prefixes.
 * @param {AssetCatalog} catalog - Host-owned asset metadata resolver.
 * @param {string} value - ID prefix supplied by the client.
 * @returns {Promise<string[]>} Unique matching IDs in numeric order.
 */
export async function completeAssetIds(
  catalog: AssetCatalog,
  value: string,
): Promise<string[]> {
  if (!/^\d*$/.test(value)) {
    return [];
  }

  const entries = await readMetadata(() => catalog.resolver.all());

  const ids = entries
    .map((entry) => entry[catalog.idField])
    .filter(
      (id): id is number =>
        typeof id === "number" && Number.isSafeInteger(id) && id > 0,
    )
    .map(String);

  return [...new Set(ids)]
    .filter((id) => id.startsWith(value))
    .sort((left, right) => Number(left) - Number(right));
}

/**
 * Complete only supported, resolvable image fields on the selected asset.
 * @param {AssetCatalog} catalog - Host-owned asset metadata resolver.
 * @param {string} value - Image field prefix.
 * @param {string | undefined} id - Selected asset ID from completion context.
 * @returns {Promise<string[]>} Available fields without downloading media.
 */
export async function completeImageFields(
  catalog: AssetCatalog,
  value: string,
  id: string | undefined,
): Promise<string[]> {
  const entry = await selectedEntry(catalog, id);

  if (!entry) {
    return [];
  }

  return ImageFieldSchema.options
    .filter((field) => field.startsWith(value))
    .filter((field) => {
      try {
        imageUrl(catalog.kind, entry, field);

        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

/**
 * Complete advertised, resolvable map layers on the selected track.
 * @param {AssetCatalog} tracks - Host-owned track metadata resolver.
 * @param {string} value - Map layer prefix.
 * @param {string | undefined} id - Selected track ID from completion context.
 * @returns {Promise<string[]>} Available layer names without downloading media.
 */
export async function completeMapLayers(
  tracks: AssetCatalog,
  value: string,
  id: string | undefined,
): Promise<string[]> {
  const entry = await selectedEntry(tracks, id);

  const layers = entry?.track_map_layers;

  if (!entry || !layers || typeof layers !== "object") {
    return [];
  }

  return Object.keys(layers)
    .filter((layer) => layer.startsWith(value))
    .filter((layer) => {
      try {
        trackMapUrl(entry, layer);

        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

async function selectedEntry(
  catalog: AssetCatalog,
  id: string | undefined,
): Promise<Record<string, unknown> | null> {
  if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return null;
  }

  return readMetadata(() => catalog.resolver.get(Number(id)));
}

async function readMetadata<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch {
    throw new ProtocolError(INTERNAL_ERROR, "Unable to load asset metadata.");
  }
}
