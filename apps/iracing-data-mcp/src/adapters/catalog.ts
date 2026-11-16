import { CarApi, Configuration } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { readLinkedData } from "./linked-response.js";

/** One concrete reference-data fetcher, using the runtime's credential provider. */
export function createCarCatalogLoader(
  accessToken: () => Promise<string>,
): () => Promise<unknown[]> {
  const configuration = new Configuration({ accessToken });
  const cars = new CarApi(configuration);

  return async () => {
    const signal = AbortSignal.timeout(15_000);
    const envelope = await cars.getCar({ signal });

    // Persist the materialized document, never the expiring signed URL.
    return z.array(z.unknown()).parse(await readLinkedData(envelope, signal));
  };
}
