import {
  CarApi,
  Configuration,
  SeriesApi,
  TrackApi,
} from "@iracing-data/api-client-fetch";
import { readLinkedData } from "./linked-response.js";

/** Supported iRacing static asset catalogs (not race results). */
export type AssetKind = "car" | "track" | "series";

/** A single linked Data API response is fully materialized before persistence. */
export function createAssetCatalogLoader(
  kind: AssetKind,
  accessToken: () => Promise<string>,
  fetchApi: typeof fetch = fetch,
): () => Promise<unknown> {
  const configuration = new Configuration({ accessToken, fetchApi });

  return async () => {
    const signal = AbortSignal.timeout(15_000);
    let envelope;

    switch (kind) {
      case "car":
        envelope = await new CarApi(configuration).getCarAssets({ signal });
        break;
      case "track":
        envelope = await new TrackApi(configuration).getTrackAssets({ signal });
        break;
      case "series":
        envelope = await new SeriesApi(configuration).getSeriesAssets({ signal });
        break;
    }

    return readLinkedData(envelope, signal, fetchApi);
  };
}
