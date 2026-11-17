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
      load: createCatalogLoader((signal) => cars.getCar({ signal }), fetchApi),
    }),
    createReferenceCatalog(directory, {
      ...TracksCatalog,
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
