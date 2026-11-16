import { join } from "node:path";
import { z } from "zod";
import { createFileBackedResolver } from "./snapshots.js";

/** A validated reference dataset and its constant-time entity lookup. */
export interface CatalogResolver<T> {
  /**
   * Return the complete validated collection.
   * @returns {Promise<readonly T[]>} Shared reference entries.
   */
  all(): Promise<readonly T[]>;

  /**
   * Resolve an entity by its upstream numeric ID.
   * @param {number} id - Upstream entity key.
   * @returns {Promise<T | null>} Matching entity, or null when absent.
   */
  get(id: number): Promise<T | null>;
}

/** Dataset-specific metadata; storage, indexing and registration are shared. */
export interface CatalogDefinition<T> {
  /** URI collection name and snapshot basename. */
  readonly name: string;

  /** Human-readable resource title. */
  readonly title: string;

  /** Agent-facing instructions for using this dataset. */
  readonly description: string;

  /** Upstream ID field advertised in the resource template. */
  readonly idField: string;

  /** Canonical validation and publication schema for the complete collection. */
  readonly schema: z.ZodType<readonly T[]>;

  /** Canonical validation and publication schema for one entity. */
  readonly entitySchema: z.ZodType<T>;

  /**
   * Extract the dataset's entity key.
   * @param {T} entry - Validated reference entry.
   * @returns {number} Upstream entity key.
   */
  readonly id: (entry: T) => number;

  /**
   * Fetch a complete, materialized dataset.
   * @returns {Promise<unknown>} Upstream reference payload.
   */
  readonly load: () => Promise<unknown>;
}

/** The resource layer consumes the same interface for every reference catalog. */
export interface ReferenceCatalog {
  /** URI collection name and snapshot basename. */
  readonly name: string;

  /** Human-readable resource title. */
  readonly title: string;

  /** Agent-facing instructions for using this dataset. */
  readonly description: string;

  /** Upstream ID field advertised in the resource template. */
  readonly idField: string;

  /** Shared hydrated dataset and entity index. */
  readonly resolver: CatalogResolver<unknown>;

  /** Published JSON Schema describing the collection data. */
  readonly collectionJsonSchema: Readonly<Record<string, unknown>>;

  /** Published JSON Schema describing a single entity. */
  readonly entityJsonSchema: Readonly<Record<string, unknown>>;
}

/**
 * Compose a validated disk snapshot with a process-local entity index.
 * @param {string} directory - Directory containing reference snapshots.
 * @param {CatalogDefinition<T>} definition - Typed dataset-specific validation, fetch and identity.
 * @returns {ReferenceCatalog} Resource metadata and shared dataset resolver.
 */
export function createReferenceCatalog<T>(
  directory: string,
  definition: CatalogDefinition<T>,
): ReferenceCatalog {
  return {
    name: definition.name,
    title: definition.title,
    description: definition.description,
    idField: definition.idField,
    collectionJsonSchema: z.toJSONSchema(definition.schema),
    entityJsonSchema: z.toJSONSchema(definition.entitySchema),
    resolver: createCatalogResolver(
      createFileBackedResolver(
        join(directory, `${definition.name}.json`),
        definition.load,
        (document) => {
          const entries = definition.schema.parse(document);

          indexEntries(entries, definition.id);

          return entries;
        },
      ),
      definition.id,
    ),
  };
}

/**
 * Coalesce hydration, reject ambiguous IDs and allow failed loads to retry.
 * @param {() => Promise<readonly T[]>} load - Loader of validated reference entries.
 * @param {(entry: T) => number} id - Extractor for the upstream entity key.
 * @returns {CatalogResolver<T>} Coalesced collection and indexed entity resolver.
 */
export function createCatalogResolver<T>(
  load: () => Promise<readonly T[]>,
  id: (entry: T) => number,
): CatalogResolver<T> {
  let current:
    | Promise<{
        entries: readonly T[];
        byId: ReadonlyMap<number, T>;
      }>
    | undefined;

  async function resolve() {
    current ??= load()
      .then((entries) => {
        const byId = indexEntries(entries, id);

        return { entries, byId };
      })
      .catch((error: unknown) => {
        current = undefined;
        throw error;
      });

    return current;
  }

  return {
    all: async () => (await resolve()).entries,
    get: async (key) => (await resolve()).byId.get(key) ?? null,
  };
}

function indexEntries<T>(
  entries: readonly T[],
  id: (entry: T) => number,
): ReadonlyMap<number, T> {
  const byId = new Map<number, T>();

  for (const entry of entries) {
    const key = id(entry);

    if (!Number.isSafeInteger(key) || key < 0 || byId.has(key)) {
      throw new Error(`Invalid or duplicate catalog ID: ${String(key)}.`);
    }

    byId.set(key, entry);
  }

  return byId;
}
