import {
  CarApi,
  CarclassApi,
  TrackApi,
  Configuration,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  CarJsonSchema,
  CarCatalogJsonSchema,
  TrackJsonSchema,
  TrackCatalogJsonSchema,
  CarClassJsonSchema,
  CarClassCatalogJsonSchema,
} from "@iracing-data/api-schema";
import { createReferenceCatalog } from "../catalog.js";
import { readLinkedData } from "./linked-response.js";
import type { ReferenceCatalog } from "../catalog.js";

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

  return [
    createReferenceCatalog(directory, {
      name: "cars",
      title: "iRacing Cars",
      description:
        "Resolve car_id from race results to car_name and complete car metadata.",
      idField: "car_id",
      schema: CarCatalogJsonSchema,
      entitySchema: CarJsonSchema,
      id: (car) => car.car_id,
      load: createCatalogLoader((signal) => cars.getCar({ signal }), fetchApi),
    }),
    createReferenceCatalog(directory, {
      name: "tracks",
      title: "iRacing Tracks",
      description:
        "Resolve track_id from race results to track_name, configuration and complete track metadata.",
      idField: "track_id",
      schema: TrackCatalogJsonSchema,
      entitySchema: TrackJsonSchema,
      id: (track) => track.track_id,
      load: createCatalogLoader(
        (signal) => tracks.getTrack({ signal }),
        fetchApi,
      ),
    }),
    createReferenceCatalog(directory, {
      name: "car-classes",
      title: "iRacing Car Classes",
      description:
        "Resolve car_class_id from race results to class names and member cars; resolve their car_id values using iracing://cars/{car_id}.",
      idField: "car_class_id",
      schema: CarClassCatalogJsonSchema,
      entitySchema: CarClassJsonSchema,
      id: (carClass) => carClass.car_class_id,
      load: createCatalogLoader(
        (signal) => classes.getCarClass({ signal }),
        fetchApi,
      ),
    }),
  ];
}
