/** A host-owned reference dataset and entity lookup. */
export interface CatalogResolver<T> {
  /**
   * Return the complete validated collection.
   * @returns {Promise<readonly T[]>} Reference entries.
   */
  all(): Promise<readonly T[]>;

  /**
   * Resolve an entity by its upstream numeric ID.
   * @param {number} id - Upstream entity key.
   * @returns {Promise<T | null>} Matching entity, or null when absent.
   */
  get(id: number): Promise<T | null>;
}

/** Published resource contract with host-injected data access. */
export interface ReferenceCatalog {
  /** URI collection name. */
  readonly name: string;

  /** Human-readable resource title. */
  readonly title: string;

  /** Agent-facing instructions for using this dataset. */
  readonly description: string;

  /** Upstream ID field advertised in the resource template. */
  readonly idField: string;

  /** Host-owned collection and entity access. */
  readonly resolver: CatalogResolver<unknown>;

  /** Published JSON Schema describing the collection data. */
  readonly collectionJsonSchema: Readonly<Record<string, unknown>>;

  /** Published JSON Schema describing a single entity. */
  readonly entityJsonSchema: Readonly<Record<string, unknown>>;
}
