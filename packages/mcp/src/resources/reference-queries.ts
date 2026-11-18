import { ApplicationFailure } from "../diagnostics/errors.js";
import { ReferenceEntrySchema } from "../tools/find-reference/schema.js";
import type {
  ReferenceEntry,
  ReferenceKind,
} from "../tools/find-reference/schema.js";
import type { ReferenceQueries } from "../tools/find-reference/service.js";
import type { AssetCatalog } from "./assets/service.js";
import type { ReferenceCatalog } from "./service.js";

/** Fixed upstream identity/name fields; this is not a dynamic tool registry. */
const fields = {
  cars: ["car_id", "car_name", "car_make", "car_model", "car_name_abbreviated"],
  tracks: ["track_id", "track_name", "config_name"],
  series: ["series_id", "series_name", "series_short_name"],
  "car-classes": ["car_class_id", "name", "short_name"],
} as const;

/**
 * Adapt explicitly selected resource resolvers to the narrow lookup capability.
 * @param {readonly ReferenceCatalog[]} catalogs - Host-owned metadata catalogs.
 * @param {readonly AssetCatalog[]} assets - Host-selected asset namespaces.
 * @returns {ReferenceQueries} Lazy adapter sharing the same snapshots and indexes.
 */
export function createCatalogReferenceQueries(
  catalogs: readonly ReferenceCatalog[],
  assets: readonly AssetCatalog[] = [],
): ReferenceQueries {
  return {
    async list(kind, { signal }) {
      signal.throwIfAborted();

      const catalog = catalogs.find((candidate) => candidate.name === kind);

      if (!catalog) {
        return null;
      }

      const entries = await catalog.resolver.all();

      signal.throwIfAborted();

      return {
        entries: entries.map((entry) => project(kind, entry)),
        metadata_available: true,
        assets_available: assets.some((asset) => asset.kind === kind),
      };
    },
  };
}

function project(kind: ReferenceKind, value: unknown): ReferenceEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  }

  const raw = value as Record<string, unknown>;

  const [id, name, ...aliases] = fields[kind];

  const label = raw[name];

  const displayName =
    kind === "tracks" &&
    typeof label === "string" &&
    typeof raw.config_name === "string" &&
    raw.config_name.trim()
      ? `${label} — ${raw.config_name}`
      : label;

  const result = ReferenceEntrySchema.safeParse({
    id: raw[id],
    name: displayName,
    aliases: aliases
      .map((field: string) => raw[field])
      .filter((alias) => typeof alias === "string"),
  });

  if (!result.success) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  }

  return result.data;
}
