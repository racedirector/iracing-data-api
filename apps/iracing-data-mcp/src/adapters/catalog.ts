import {
  CarApi,
  CarclassApi,
  TrackApi,
  SeriesApi,
  Configuration,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  CarsCatalog,
  TracksCatalog,
  CarClassesCatalog,
  SeriesCatalog,
} from "@iracing-data/mcp";
import { createReferenceCatalog } from "../catalog.js";
import { readLinkedData } from "./linked-response.js";
import type { ReferenceCatalog } from "@iracing-data/mcp";

/**
 * One signed-link materialization path for all generated reference API calls.
 * @param {(signal: AbortSignal) => Promise<IracingAPIResponse>} request - Generated SDK operation returning a signed-link envelope.
 * @param {typeof fetch} fetchApi - Unsigned download transport.
 * @returns {() => Promise<unknown>} Loader of materialized reference data.
 */
export function createCatalogLoader(
  request: (signal: AbortSignal) => Promise<IracingAPIResponse>,
  fetchApi: typeof fetch = fetch,
): () => Promise<unknown> {
  return async () => {
    const signal = AbortSignal.timeout(15_000);

    return readLinkedData(await request(signal), signal, fetchApi);
  };
}

/**
 * Concrete SDK selection and narrow, non-stripping dataset definitions.
 * @param {string} directory - Directory containing reference snapshots.
 * @param {() => Promise<string>} accessToken - Shared runtime OAuth token resolver.
 * @param {typeof fetch} fetchApi - Injected network implementation.
 * @returns {readonly ReferenceCatalog[]} Catalog definitions composed with shared persistence and indexing.
 */
export function createReferenceCatalogs(
  directory: string,
  accessToken: () => Promise<string>,
  fetchApi: typeof fetch = fetch,
): readonly ReferenceCatalog[] {
  const configuration = new Configuration({ accessToken, fetchApi });

  const cars = new CarApi(configuration);

  const tracks = new TrackApi(configuration);

  const classes = new CarclassApi(configuration);

  const series = new SeriesApi(configuration);

  return [
    createReferenceCatalog(directory, {
      ...CarsCatalog,
      description:
        "Resolve car_id from race results to car_name and complete car metadata. Image metadata: iracing://assets/cars/{id}; image bytes: iracing://images/cars/{id}/{field}.",
      load: createCatalogLoader((signal) => cars.getCar({ signal }), fetchApi),
    }),
    createReferenceCatalog(directory, {
      ...TracksCatalog,
      description:
        "Resolve track_id from race results to track_name, configuration and complete track metadata. Asset metadata: iracing://assets/tracks/{id}; image bytes: iracing://images/tracks/{id}/{field}; map layers: iracing://track-maps/{track_id}/{layer}.",
      load: createCatalogLoader(
        (signal) => tracks.getTrack({ signal }),
        fetchApi,
      ),
    }),
    createReferenceCatalog(directory, {
      ...CarClassesCatalog,
      load: createCatalogLoader(
        (signal) => classes.getCarClass({ signal }),
        fetchApi,
      ),
    }),
    createReferenceCatalog(directory, {
      ...SeriesCatalog,
      load: createCatalogLoader(
        (signal) => series.getSeries({ signal }),
        fetchApi,
      ),
    }),
  ];
}
