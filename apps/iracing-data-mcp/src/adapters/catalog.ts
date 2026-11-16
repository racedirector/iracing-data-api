import { CarApi, Configuration } from "@iracing-data/api-client-fetch";
import { readLinkedData } from "./linked-response.js";

/** Fetch and materialize the car catalog; validation belongs to the resolver. */
export function createCarCatalogLoader(
  accessToken: () => Promise<string>,
  fetchApi: typeof fetch = fetch,
): () => Promise<unknown> {
  const configuration = new Configuration({ accessToken, fetchApi });
  const cars = new CarApi(configuration);

  return async () => {
    const signal = AbortSignal.timeout(15_000);
    const envelope = await cars.getCar({ signal });

    // Never persist expiring signed download links or bearer credentials.
    return readLinkedData(envelope, signal, fetchApi);
  };
}
