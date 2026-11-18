import {
  CarAssetsPayloadSchema,
  CarAssetPayloadSchema,
  TrackAssetsPayloadSchema,
  TrackAssetPayloadSchema,
  SeriesAssetsPayloadSchema,
  SeriesAssetPayloadSchema,
} from "@iracing-data/api-schema";
import { createResourceSchema } from "../schemas.js";
import { AssetMediaIndexSchema } from "./media-index.js";
import type { CatalogResolver } from "../service.js";
import type { AssetCatalog, AssetKind } from "./service.js";
import type { z } from "zod";

/** Metadata identity and canonical document/entity schemas. */
export interface AssetDefinition {
  /** Static metadata namespace. */
  readonly kind: AssetKind;

  /** Upstream entity identity field. */
  readonly idField: string;

  /** Complete ID-keyed document acceptance. */
  readonly documentSchema: z.ZodType;

  /** Individual entry acceptance. */
  readonly entitySchema: z.ZodType;
}

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

/**
 * Pair asset definitions and separate schemas with host metadata access.
 * @param {AssetDefinition} definition - Authored metadata contract.
 * @param {CatalogResolver<Record<string, unknown>>} resolver - Host-owned indexed metadata.
 * @returns {AssetCatalog} Registerable asset resources.
 */
export function createAssetResource(
  definition: AssetDefinition,
  resolver: CatalogResolver<Record<string, unknown>>,
): AssetCatalog {
  const name = `assets/${definition.kind}`;

  return {
    kind: definition.kind,
    idField: definition.idField,
    resolver,
    schemas: [
      createResourceSchema(
        name,
        `${definition.kind} asset document schema`,
        definition.documentSchema,
      ),
      createResourceSchema(
        `${name}/entity`,
        `${definition.kind} asset entity schema`,
        definition.entitySchema,
      ),
      createResourceSchema(
        `${name}/media`,
        `${definition.kind} media index schema`,
        AssetMediaIndexSchema,
      ),
    ],
  };
}
