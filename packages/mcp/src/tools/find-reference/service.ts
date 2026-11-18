import type { ReferenceDataset, ReferenceKind } from "./schema.js";

/** Host-selected reference access, independent of SDKs, credentials and transport. */
export interface ReferenceQueries {
  /**
   * Read one explicitly selected catalog without loading other namespaces.
   * @param {ReferenceKind} kind - Catalog to resolve.
   * @param {{signal: AbortSignal}} options - Operation cancellation.
   * @param {AbortSignal} options.signal - Cancellation forwarded to the selected catalog.
   * @returns {Promise<ReferenceDataset | null>} Snapshot, or null when not configured.
   */
  list(
    kind: ReferenceKind,
    options: { signal: AbortSignal },
  ): Promise<ReferenceDataset | null>;
}
