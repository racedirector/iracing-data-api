import { ReferenceDatasetSchema } from "./schema.js";
import type { FailureFor } from "../../diagnostics/errors.js";
import type { OperationContext, Result } from "../types.js";
import type {
  FindReferenceInput,
  FindReferenceOutput,
  ReferenceDataset,
  ReferenceEntry,
} from "./schema.js";
import type { ReferenceQueries } from "./service.js";

/**
 * Find reference identities without inferring metadata from race results.
 * @param {ReferenceQueries} queries - Host-selected catalog access.
 * @param {FindReferenceInput} input - Parsed lookup criteria.
 * @param {OperationContext} context - Operation cancellation.
 * @returns {Promise<Result<FindReferenceOutput, FailureFor<"DATA_RESOLUTION_FAILED">>>} Bounded projected candidates.
 */
export async function handleFindReference(
  queries: ReferenceQueries,
  input: FindReferenceInput,
  context: OperationContext,
): Promise<Result<FindReferenceOutput, FailureFor<"DATA_RESOLUTION_FAILED">>> {
  context.signal.throwIfAborted();

  const raw = await queries.list(input.kind, { signal: context.signal });

  context.signal.throwIfAborted();
  if (raw === null) {
    return { ok: true, data: response(input, false, []) };
  }

  const checked = ReferenceDatasetSchema.safeParse(raw);

  if (
    !checked.success ||
    checked.data.entries.some(
      (entry) => input.kind !== "car-classes" && entry.id === 0,
    ) ||
    new Set(checked.data.entries.map((entry) => entry.id)).size !==
      checked.data.entries.length
  ) {
    return {
      ok: false,
      error: { code: "DATA_RESOLUTION_FAILED", reason: "invalid_data" },
    };
  }

  const query = normalize(input.query);

  const terms = query.split(/\s+/);

  const matches = checked.data.entries
    .filter((entry) => {
      context.signal.throwIfAborted();
      if (/^\d+$/.test(query)) {
        return entry.id === Number(query);
      }

      const text = normalize([entry.name, ...(entry.aliases ?? [])].join(" "));

      return terms.every((term) => text.includes(term));
    })
    .sort(
      (left, right) =>
        rank(left, query) - rank(right, query) ||
        left.name.localeCompare(right.name, "en") ||
        left.id - right.id,
    );

  return { ok: true, data: response(input, true, matches, checked.data) };
}

function response(
  input: FindReferenceInput,
  available: boolean,
  entries: readonly ReferenceEntry[],
  dataset?: ReferenceDataset,
): FindReferenceOutput {
  const matches = entries.slice(0, input.limit).map(({ id, name }) => {
    const suffix = `${input.kind}/${String(id)}`;

    return {
      id,
      name,
      ...(dataset?.metadata_available
        ? { metadata_uri: `iracing://${suffix}` }
        : {}),
      ...(dataset?.assets_available && input.kind !== "car-classes"
        ? {
            asset_metadata_uri: `iracing://assets/${suffix}`,
            media_index_uri: `iracing://assets/${suffix}/media`,
          }
        : {}),
    };
  });

  return {
    kind: input.kind,
    query: input.query,
    available,
    total_matches: entries.length,
    returned_count: matches.length,
    has_more: entries.length > matches.length,
    matches,
  };
}

function normalize(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

function rank(entry: ReferenceEntry, query: string): number {
  const name = normalize(entry.name);

  if (name === query) {
    return 0;
  }

  if (name.startsWith(query)) {
    return 1;
  }

  return 2;
}
