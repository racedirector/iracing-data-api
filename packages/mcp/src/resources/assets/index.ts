import { ResourceTemplate } from "@modelcontextprotocol/server";
import { registerResourceSchemas } from "../schemas.js";
import {
  completeAssetIds,
  completeImageFields,
  completeMapLayers,
} from "./completion.js";
import { registerAssetMediaIndex } from "./media-index.js";
import { assetId, imageUrl, trackMapUrl, ImageFieldSchema } from "./service.js";
import type { AssetCatalog, ReadAssetMedia } from "./service.js";
import type { McpServer } from "@modelcontextprotocol/server";

/**
 * Advertise lazy asset metadata, binary images and individual SVG map layers.
 * @param {Pick<McpServer, "registerResource">} server - Caller-owned resource registration surface.
 * @param {readonly AssetCatalog[]} catalogs - Injected static metadata resolvers.
 * @param {ReadAssetMedia} readMedia - Credential-free image transport.
 */
export function registerAssetResources(
  server: Pick<McpServer, "registerResource">,
  catalogs: readonly AssetCatalog[],
  readMedia: ReadAssetMedia,
): void {
  for (const catalog of catalogs) {
    registerResourceSchemas(server, catalog.schemas ?? []);
    registerAssetMediaIndex(server, catalog);
    registerMetadata(server, catalog);
    server.registerResource(
      `${catalog.kind}-image`,
      new ResourceTemplate(`iracing://images/${catalog.kind}/{id}/{field}`, {
        list: undefined,
        complete: {
          id: (value) => completeAssetIds(catalog, value),
          field: (value, context) =>
            completeImageFields(catalog, value, context?.arguments?.id),
        },
      }),
      {
        title: `iRacing ${catalog.kind} images`,
        description: `Read image bytes as MCP blob content. First read iracing://assets/${catalog.kind}/{id} for available fields. Select small_image, large_image, logo, sponsor_logo or group_image; missing/null fields fail explicitly. Media is fetched unsigned, up to 5 MiB; MIME type is in the response.`,
      },
      async (uri, variables, context) => {
        context.mcpReq.signal.throwIfAborted();
        const field = ImageFieldSchema.parse(variables.field);

        const entry = await requireEntry(catalog, assetId(variables.id));

        const media = await readMedia(
          imageUrl(catalog.kind, entry, field),
          context.mcpReq.signal,
        );

        return { contents: [{ uri: uri.href, ...media }] };
      },
    );
  }

  const tracks = catalogs.find((catalog) => catalog.kind === "tracks");

  if (tracks) {
    registerTrackMaps(server, tracks, readMedia);
  }
}

function registerMetadata(
  server: Pick<McpServer, "registerResource">,
  catalog: AssetCatalog,
): void {
  const description = `All static ${catalog.kind} asset metadata, including images and other upstream references. Collections return an ID-keyed JSON object; entity reads return one JSON object. Document keys are ${catalog.idField} strings. Data loading and refresh policy are managed by the host. Image resources: iracing://images/${catalog.kind}/{id}/{field}. ${catalog.kind === "tracks" ? "Map layers: iracing://track-maps/{track_id}/{layer}; available keys are in track_map_layers." : ""} Non-image references such as manuals, paint templates and screenshot/gallery tokens remain metadata; no undocumented URL bases are invented.`;

  server.registerResource(
    `${catalog.kind}-assets`,
    `iracing://assets/${catalog.kind}`,
    {
      title: `iRacing ${catalog.kind} assets`,
      description,
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            Object.fromEntries(
              (await catalog.resolver.all()).map((entry) => [
                String(entry[catalog.idField]),
                entry,
              ]),
            ),
          ),
        },
      ],
    }),
  );
  server.registerResource(
    `${catalog.kind}-asset`,
    new ResourceTemplate(`iracing://assets/${catalog.kind}/{id}`, {
      list: undefined,
      complete: {
        id: (value) => completeAssetIds(catalog, value),
      },
    }),
    {
      title: `iRacing ${catalog.kind} asset metadata`,
      description,
      mimeType: "application/json",
    },
    async (uri, variables) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            await requireEntry(catalog, assetId(variables.id)),
          ),
        },
      ],
    }),
  );
}

function registerTrackMaps(
  server: Pick<McpServer, "registerResource">,
  tracks: AssetCatalog,
  readMedia: ReadAssetMedia,
): void {
  server.registerResource(
    "track-map-layer",
    new ResourceTemplate("iracing://track-maps/{track_id}/{layer}", {
      list: undefined,
      complete: {
        track_id: (value) => completeAssetIds(tracks, value),
        layer: (value, context) =>
          completeMapLayers(tracks, value, context?.arguments?.track_id),
      },
    }),
    {
      title: "iRacing track map layer",
      description:
        "SVG map layer bytes as MCP blob content. Read iracing://assets/tracks/{id} first; choose an exact track_map_layers key (for example active, background, pitroad, start-finish, turns). Layers are separate images, not a composed map. Treat SVG as untrusted media; do not execute embedded scripts.",
      mimeType: "image/svg+xml",
    },
    async (uri, variables, context) => {
      context.mcpReq.signal.throwIfAborted();
      if (typeof variables.layer !== "string") {
        throw new Error("A track map layer is required.");
      }

      const entry = await requireEntry(tracks, assetId(variables.track_id));

      const media = await readMedia(
        trackMapUrl(entry, variables.layer),
        context.mcpReq.signal,
      );

      if (media.mimeType !== "image/svg+xml") {
        throw new Error("Track map layer did not return SVG.");
      }

      return { contents: [{ uri: uri.href, ...media }] };
    },
  );
}

async function requireEntry(
  catalog: AssetCatalog,
  id: number,
): Promise<Record<string, unknown>> {
  const entry = await catalog.resolver.get(id);

  if (!entry) {
    throw new Error(`${catalog.kind} asset ${String(id)} not found.`);
  }

  return entry;
}
