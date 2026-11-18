import {
  INTERNAL_ERROR,
  ProtocolError,
  ResourceNotFoundError,
  ResourceTemplate,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import { completeAssetIds } from "./completion.js";
import { assetId, imageUrl, ImageFieldSchema, trackMapUrl } from "./service.js";
import type { AssetCatalog } from "./service.js";
import type { McpServer } from "@modelcontextprotocol/server";

/** Projection schema for available MCP media URIs, not upstream download URLs. */
export const AssetMediaIndexSchema = z
  .object({
    kind: z.enum(["cars", "tracks", "series"]),
    id: z.int().positive(),
    images: z.array(z.object({ field: ImageFieldSchema, uri: z.url() })),
    track_maps: z.array(
      z.object({
        layer: z.string(),
        uri: z.url(),
        mimeType: z.literal("image/svg+xml"),
      }),
    ),
  })
  .meta({
    title: "iRacing asset media index",
    description:
      "Available safely resolvable image and map-layer MCP resource URIs for one asset. Availability is based on metadata, not a successful media download.",
  });

/**
 * Enumerate read-ready media resource URIs without fetching binary content.
 * @param {AssetCatalog} catalog - Selected metadata namespace.
 * @param {number} id - Upstream entity ID.
 * @param {Record<string, unknown>} entry - Host-owned metadata entry.
 * @returns {z.infer<typeof AssetMediaIndexSchema>} Available media selectors and URIs.
 */
export function createAssetMediaIndex(
  catalog: AssetCatalog,
  id: number,
  entry: Record<string, unknown>,
): z.infer<typeof AssetMediaIndexSchema> {
  const images = ImageFieldSchema.options
    .filter((field) => {
      try {
        imageUrl(catalog.kind, entry, field);

        return true;
      } catch {
        return false;
      }
    })
    .map((field) => ({
      field,
      uri: `iracing://images/${catalog.kind}/${String(id)}/${field}`,
    }));

  const layers = entry.track_map_layers;

  const trackMaps =
    catalog.kind === "tracks" && layers && typeof layers === "object"
      ? Object.keys(layers)
          .filter((layer) => {
            try {
              trackMapUrl(entry, layer);

              return true;
            } catch {
              return false;
            }
          })
          .sort()
          .map((layer) => ({
            layer,
            uri: `iracing://track-maps/${String(id)}/${encodeURIComponent(layer)}`,
            mimeType: "image/svg+xml" as const,
          }))
      : [];

  return { kind: catalog.kind, id, images, track_maps: trackMaps };
}

/**
 * Publish per-asset media discovery for clients without completion support.
 * @param {Pick<McpServer, "registerResource">} server - Caller-owned registration surface.
 * @param {AssetCatalog} catalog - Host-selected metadata access.
 */
export function registerAssetMediaIndex(
  server: Pick<McpServer, "registerResource">,
  catalog: AssetCatalog,
): void {
  server.registerResource(
    `${catalog.kind}-asset-media`,
    new ResourceTemplate(`iracing://assets/${catalog.kind}/{id}/media`, {
      list: undefined,
      complete: { id: (value) => completeAssetIds(catalog, value) },
    }),
    {
      title: `iRacing ${catalog.kind} available media`,
      mimeType: "application/json",
      description:
        "Available image fields and track-map layers with ready-to-read MCP resource URIs. Omits missing, null, unsupported and unsafe references. Metadata-only discovery; no binary downloads. Media existence is verified only when read.",
    },
    async (uri, variables) => {
      const id = assetId(variables.id);

      const entry = await readEntry(catalog, id);

      if (entry === null) {
        throw new ResourceNotFoundError(uri.href);
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(createAssetMediaIndex(catalog, id, entry)),
          },
        ],
      };
    },
  );
}

async function readEntry(
  catalog: AssetCatalog,
  id: number,
): Promise<Record<string, unknown> | null> {
  try {
    return await catalog.resolver.get(id);
  } catch {
    throw new ProtocolError(INTERNAL_ERROR, "Unable to load asset metadata.");
  }
}
