import {
  ResultsApi,
  ResultsSearchSeriesResponseToJSON,
  ResultsSearchHostedResponseToJSON,
  type Configuration,
} from "@iracing-data/api-client-fetch";
import { EventTypeSchema } from "@iracing-data/api-schema";
import {
  ApplicationFailure,
  SearchInput,
  SearchRow,
  invalidInputFailure,
  type RaceSearchInput,
  type RaceSearchQueries,
} from "@iracing-data/mcp";
import { z } from "zod";
import { mapUpstreamFailure } from "./errors.js";

const manifestSchema = z.object({
  data: z.object({
    success: z.literal(true),
    chunk_info: z.object({
      rows: z.int().nonnegative(),
      num_chunks: z.int().nonnegative(),
      chunk_size: z.int().nonnegative(),
      base_download_url: z.string().nullable(),
      chunk_file_names: z.array(z.string()),
    }),
  }),
});

type ChunkInfo = z.infer<typeof manifestSchema>["data"]["chunk_info"];

/** Convert an optional validated UTC timestamp for the generated client. */
function date(value: string | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

/** Validate counts before interpreting an upstream manifest as search coverage. */
function resolveManifest(raw: unknown, index: number): ChunkInfo {
  const parsed = manifestSchema.safeParse(raw);

  if (!parsed.success) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  const info = parsed.data.data.chunk_info;

  if (
    info.num_chunks !== info.chunk_file_names.length ||
    (info.rows === 0) !== (info.num_chunks === 0) ||
    (info.rows > 0 &&
      (info.chunk_size === 0 ||
        Math.ceil(info.rows / info.chunk_size) !== info.num_chunks))
  ) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  if (index >= Math.max(1, info.num_chunks)) {
    throw new ApplicationFailure("INVALID_INPUT");
  }

  return info;
}

/** Reject absolute foreign links and paths outside the upstream download prefix. */
function chunkTarget(info: ChunkInfo, index: number): URL {
  try {
    if (!info.base_download_url) {
      throw new Error("Missing base");
    }

    const base = new URL(info.base_download_url);

    const target = new URL(info.chunk_file_names[index], base);

    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      target.origin !== base.origin ||
      !target.pathname.startsWith(base.pathname) ||
      target.username ||
      target.password
    ) {
      throw new Error("Unsafe link");
    }

    return target;
  } catch {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }
}

/** Materialize only the requested upstream chunk, without actor credentials. */
async function readChunk(
  info: ChunkInfo,
  index: number,
  signal: AbortSignal,
  downloadFetch: typeof fetch,
) {
  if (info.num_chunks === 0) {
    return [];
  }

  const target = chunkTarget(info, index);

  signal.throwIfAborted();
  let response: Response;

  try {
    response = await downloadFetch(target.href, { signal, redirect: "error" });
  } catch {
    throw new ApplicationFailure("UPSTREAM_UNAVAILABLE");
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
        reason: "link_rejected",
      });
    }

    if (response.status === 429) {
      throw new ApplicationFailure("RATE_LIMITED");
    }

    if (response.status >= 500 || response.status === 408) {
      throw new ApplicationFailure("UPSTREAM_UNAVAILABLE");
    }

    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  const rows = z.array(SearchRow).safeParse(payload);

  const expected = Math.min(
    info.chunk_size,
    info.rows - index * info.chunk_size,
  );

  if (!rows.success || rows.data.length !== expected) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  return rows.data;
}

/** Convert tool UTC strings to generated-client Date parameters at the adapter boundary. */
async function searchManifest(
  api: ResultsApi,
  input: RaceSearchInput,
  signal: AbortSignal,
) {
  const { source, chunk_index: _index, ...criteria } = input;

  const wire = {
    ...criteria,

    // MCP tools retain CSV-string filters; generated SDKs consume typed arrays.
    event_types: criteria.event_types
      ?.split(",")
      .map((value) => EventTypeSchema.parse(Number(value))),
    category_ids: criteria.category_ids?.split(",").map(Number),
    start_range_begin: date(criteria.start_range_begin),
    start_range_end: date(criteria.start_range_end),
    finish_range_begin: date(criteria.finish_range_begin),
    finish_range_end: date(criteria.finish_range_end),
  };

  try {
    return source === "series"
      ? ResultsSearchSeriesResponseToJSON(
          await api.getResultsSearchSeries(wire, { signal }),
        )
      : ResultsSearchHostedResponseToJSON(
          await api.getResultsSearchHosted(wire, { signal }),
        );
  } catch (error) {
    throw mapUpstreamFailure(error);
  }
}

/**
 * Bind historical session search to an actor-owned client.
 * @param {Configuration} configuration - Host-owned credentials and HTTP implementation.
 * @param {typeof fetch} downloadFetch - Independent unsigned chunk transport, never an authenticated generated-client wrapper.
 * @returns {RaceSearchQueries} Tool-local search with isolated signed chunk downloads.
 */
export function createRaceSearchQueries(
  configuration: Configuration,
  downloadFetch: typeof fetch = fetch,
): RaceSearchQueries {
  const api = new ResultsApi(configuration);

  return {
    async search(input, { signal }) {
      // Re-validate at the host boundary. This parse reads the clock again, so a
      // window that passed the execution layer can still fail here; project it as
      // the same bounded input failure rather than an internal error.
      const checked = SearchInput.safeParse(input);

      if (!checked.success) {
        throw invalidInputFailure(checked.error);
      }

      const { source, chunk_index, ...criteria } = checked.data;

      signal.throwIfAborted();
      const info = resolveManifest(
        await searchManifest(api, checked.data, signal),
        chunk_index,
      );

      const results = await readChunk(info, chunk_index, signal, downloadFetch);

      signal.throwIfAborted();

      return {
        source,
        criteria,
        total_matches: info.rows,
        total_chunks: info.num_chunks,
        chunk_index,
        returned_count: results.length,
        query_complete: results.length === info.rows,
        results,
        position_basis: "upstream",
      };
    },
  };
}
