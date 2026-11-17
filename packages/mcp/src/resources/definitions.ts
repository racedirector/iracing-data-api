import {
  CarPayloadSchema,
  CarCatalogPayloadSchema,
  TrackPayloadSchema,
  TrackCatalogPayloadSchema,
  CarClassPayloadSchema,
  CarClassCatalogPayloadSchema,
} from "@iracing-data/api-schema";
import type { CatalogResolver, ReferenceCatalog } from "./service.js";
import type { z } from "zod";

/** An iRacing resource's validation, presentation and entity identity. */
export interface CatalogDefinition<T> {
  /** URI collection name. */
  readonly name: string;

  /** Human-readable resource title. */
  readonly title: string;

  /** Agent-facing instructions for using this dataset. */
  readonly description: string;

  /** Upstream entity key field. */
  readonly idField: string;

  /** Canonical collection schema. */
  readonly schema: z.ZodType<readonly T[]>;

  /** Canonical entity schema. */
  readonly entitySchema: z.ZodType<T>;

  /**
   * Extract the upstream entity key.
   * @param {T} entry - Validated reference entry.
   * @returns {number} Upstream entity key.
   */
  readonly id: (entry: T) => number;
}

/**
 * Publish a resource definition with host-owned data access.
 * @param {CatalogDefinition<T>} definition - Canonical iRacing resource contract.
 * @param {CatalogResolver<T>} resolver - Host-selected collection and entity access.
 * @returns {ReferenceCatalog} Resource ready for registration.
 */
export function createReferenceResource<T>(
  definition: CatalogDefinition<T>,
  resolver: CatalogResolver<T>,
): ReferenceCatalog {
  return {
    name: definition.name,
    title: definition.title,
    description: definition.description,
    idField: definition.idField,
    resolver,
  };
}

/** Cars resource contract. */
export const CarsCatalog = {
  name: "cars",
  title: "iRacing Cars",
  description:
    "Resolve car_id from race results to car_name and complete car metadata.",
  idField: "car_id",
  schema: CarCatalogPayloadSchema,
  entitySchema: CarPayloadSchema,
  id: (car) => car.car_id,
} satisfies CatalogDefinition<z.infer<typeof CarPayloadSchema>>;

/** Tracks resource contract. */
export const TracksCatalog = {
  name: "tracks",
  title: "iRacing Tracks",
  description:
    "Resolve track_id from race results to track_name, configuration and complete track metadata.",
  idField: "track_id",
  schema: TrackCatalogPayloadSchema,
  entitySchema: TrackPayloadSchema,
  id: (track) => track.track_id,
} satisfies CatalogDefinition<z.infer<typeof TrackPayloadSchema>>;

/** Car classes resource contract. */
export const CarClassesCatalog = {
  name: "car-classes",
  title: "iRacing Car Classes",
  description:
    "Resolve car_class_id from race results to class names and member cars; resolve their car_id values using iracing://cars/{car_id}.",
  idField: "car_class_id",
  schema: CarClassCatalogPayloadSchema,
  entitySchema: CarClassPayloadSchema,
  id: (carClass) => carClass.car_class_id,
} satisfies CatalogDefinition<z.infer<typeof CarClassPayloadSchema>>;
