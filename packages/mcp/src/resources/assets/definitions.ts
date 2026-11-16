import {
  CarAssetsPayloadSchema,
  CarAssetPayloadSchema,
  TrackAssetsPayloadSchema,
  TrackAssetPayloadSchema,
  SeriesAssetsPayloadSchema,
  SeriesAssetPayloadSchema,
} from "@iracing-data/api-schema";

/** Canonical static metadata definitions; hosts supply loading and persistence. */
export const AssetDefinitions = {
  cars: {
    kind: "cars",
    idField: "car_id",
    documentSchema: CarAssetsPayloadSchema,
    entitySchema: CarAssetPayloadSchema,
  },
  tracks: {
    kind: "tracks",
    idField: "track_id",
    documentSchema: TrackAssetsPayloadSchema,
    entitySchema: TrackAssetPayloadSchema,
  },
  series: {
    kind: "series",
    idField: "series_id",
    documentSchema: SeriesAssetsPayloadSchema,
    entitySchema: SeriesAssetPayloadSchema,
  },
} as const;
