import { join } from "node:path";
import { createReferenceResource } from "@iracing-data/mcp";
import { createFileBackedResolver } from "./snapshots.js";
import type {
  CatalogDefinition,
  CatalogResolver,
  ReferenceCatalog,
} from "@iracing-data/mcp";

/** Host loader added to the transport-independent resource definition. */
interface RuntimeCatalogDefinition<T> extends CatalogDefinition<T> {
  /**
   * Fetch a complete, materialized dataset.
   * @returns {Promise<unknown>} Upstream reference payload.
   */
  readonly load: () => Promise<unknown>;
}

/**
 * Compose a validated disk snapshot with a process-local entity index.
 * @param {string} directory - Directory containing reference snapshots.
 * @param {RuntimeCatalogDefinition<T>} definition - Typed dataset-specific validation, fetch and identity.
 * @returns {ReferenceCatalog} Resource metadata and shared dataset resolver.
 */
export function createReferenceCatalog<T>(
  directory: string,
  definition: RuntimeCatalogDefinition<T>,
): ReferenceCatalog {
  return createReferenceResource(
    definition,
    createCatalogResolver(
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
  );
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
