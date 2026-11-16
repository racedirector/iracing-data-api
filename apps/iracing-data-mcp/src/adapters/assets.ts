import { join } from "node:path";
import {
  CarApi,
  TrackApi,
  SeriesApi,
  Configuration,
} from "@iracing-data/api-client-fetch";
import { AssetDefinitions } from "@iracing-data/mcp";
import { createCatalogResolver } from "../catalog.js";
import { createFileBackedResolver } from "../snapshots.js";
import { createCatalogLoader } from "./catalog.js";
import type { AssetCatalog, AssetKind } from "@iracing-data/mcp";
import type { z } from "zod";

/**
 * Compose all static asset documents using the shared lazy snapshot/index path.
 * @param {string} directory - Runtime's reference snapshot directory.
 * @param {() => Promise<string>} accessToken - Shared OAuth resolver for metadata requests.
 * @param {typeof fetch} fetchApi - Injected transport for API requests and unsigned downloads.
 * @returns {readonly AssetCatalog[]} Car, track and series metadata resolvers.
 */
export function createAssetCatalogs(
  directory: string,
  accessToken: () => Promise<string>,
  fetchApi: typeof fetch = fetch,
): readonly AssetCatalog[] {
  const configuration = new Configuration({ accessToken, fetchApi });

  const cars = new CarApi(configuration);

  const tracks = new TrackApi(configuration);

  const series = new SeriesApi(configuration);

  return [
    catalog(directory, {
      ...AssetDefinitions.cars,
      load: createCatalogLoader(
        (signal) => cars.getCarAssets({ signal }),
        fetchApi,
      ),
    }),
    catalog(directory, {
      ...AssetDefinitions.tracks,
      load: createCatalogLoader(
        (signal) => tracks.getTrackAssets({ signal }),
        fetchApi,
      ),
    }),
    catalog(directory, {
      ...AssetDefinitions.series,
      load: createCatalogLoader(
        (signal) => series.getSeriesAssets({ signal }),
        fetchApi,
      ),
    }),
  ];
}

function catalog<T extends Record<string, unknown>>(
  directory: string,
  definition: {
    kind: AssetKind;
    idField: string;
    documentSchema: z.ZodType<Record<string, T>>;
    entitySchema: z.ZodType<T>;
    load: () => Promise<unknown>;
  },
): AssetCatalog {
  const { kind, idField, documentSchema, load } = definition;

  const read = createFileBackedResolver(
    join(directory, `${kind}-assets.json`),
    load,
    (raw) => {
      const document = documentSchema.parse(raw);

      for (const [key, entry] of Object.entries(document)) {
        if (key !== String(entry[idField])) {
          throw new Error(`Asset key does not match ${idField}.`);
        }
      }

      return document;
    },
  );

  return {
    kind,
    idField,
    resolver: createCatalogResolver(
      async () => Object.values(await read()),
      (entry) => Number(entry[idField]),
    ),
  };
}
