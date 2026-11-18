import type { RuntimeCatalogResolver } from "../catalog.js";
import type { AssetCatalog, ReferenceCatalog } from "@iracing-data/mcp";

/** Host-owned catalog maintenance without extending the core resource API. */
export type RefreshableCatalog = ReferenceCatalog & {
  readonly resolver: RuntimeCatalogResolver<unknown>;
};

/** The same live asset resolver used by metadata and media reads. */
export type RefreshableAssetCatalog = AssetCatalog & {
  readonly resolver: RuntimeCatalogResolver<Record<string, unknown>>;
};
