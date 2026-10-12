import { randomBytes } from "node:crypto";
import {
  MemberApi,
  ResultsApi,
  ResultsSearchSeriesResponseToJSON,
} from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { continuation } from "../../continuation.js";
import {
  ApplicationFailure,
  errorEnvelope,
  createRequestContext,
} from "../../diagnostics/errors.js";
import { parse, materialize, fetchLinkedJson } from "../../linked-response.js";
import { collectionExpired, completeResult } from "../collections.js";
import { SearchInitialInput, SearchProjection } from "./contracts.js";
import { parseManifest, validateSearchEcho, chunkUrl } from "./manifest.js";
import type { RetentionBudget } from "../../retention.js";
import type { IracingDataAccess } from "../../services.js";

type Filters = z.infer<typeof SearchInitialInput>;
type Result = ReturnType<typeof completeResult>;
interface Snapshot {
  info: ReturnType<typeof parseManifest>;
  chunks: Map<number, readonly Record<string, unknown>[]>;
  filters: Filters;
  custId: number;
  expiresAt: number;
  bytes: number;
  disposed?: boolean;
}
interface Cursor {
  snapshot: Snapshot;
  chunk: number;
  row: number;
  result?: Result;
  resultBytes?: number;
  pending?: Promise<Result>;
}

/** Immutable offsets and retained replay responses make retries deterministic. */
export class SearchCursors {
  readonly #entries = new Map<string, Cursor>();
  /** Register search expiry cleanup with the budget; now returns Unix milliseconds. */
  constructor(
    readonly budget: RetentionBudget,
    readonly now: () => number = Date.now,
  ) {
    budget.registerPruner(() => this.#prune());
  }
  /** Release retained searches whose snapshots are disposed or have expired. */
  #prune() {
    const expired = new Set<Snapshot>();

    for (const entry of this.#entries.values()) {
      if (entry.snapshot.disposed || entry.snapshot.expiresAt <= this.now()) {
        expired.add(entry.snapshot);
      }
    }

    for (const snapshot of expired) {
      this.#drop(snapshot);
    }
  }
  /** Dispose a snapshot and release its retained bytes and cursor reservations once. */
  #drop(snapshot: Snapshot) {
    if (snapshot.disposed) {
      return;
    }

    snapshot.disposed = true;
    for (const [token, entry] of this.#entries) {
      if (entry.snapshot === snapshot) {
        this.budget.release(entry.resultBytes ?? 0, 1);
        this.#entries.delete(token);
      }
    }

    this.budget.release(snapshot.bytes);
  }
  /**
   * Fetch a search manifest for validated filters and return its first bounded page.
   * An omitted cust_id resolves to the authenticated member. Continuations expire
   * after five minutes or at the earlier resolved member-link deadline.
   * API, payload, cancellation, and capacity errors propagate; failed initial pages
   * release their snapshot reservations.
   */
  async start(
    filters: Filters,
    access: IracingDataAccess,
    signal: AbortSignal,
  ): Promise<Result> {
    this.#prune();
    const member =
      filters.cust_id === undefined
        ? await materialize(
            await new MemberApi(access.configuration).getMemberInfo({ signal }),
            z.object({ cust_id: z.number().int().positive().safe() }),
            signal,
            access.configuration.fetchApi,
          )
        : undefined;
    const custId = filters.cust_id ?? member!.data.cust_id;

    const range = filters.range;

    const request = {
      cust_id: custId,
      event_types: "5",
      ...(filters.series_id === undefined
        ? {}
        : { series_id: filters.series_id }),
      ...(filters.official_only === undefined
        ? {}
        : { official_only: filters.official_only }),
      ...("start" in range
        ? {
            start_range_begin: new Date(range.start),
            start_range_end: new Date(range.start_end),
          }
        : range),
    };
    const manifest = await new ResultsApi(
      access.configuration,
    ).getResultsSearchSeries(request, { signal });
    const wire = ResultsSearchSeriesResponseToJSON(manifest);
    const info = parseManifest(wire);
    validateSearchEcho(
      wire,
      Object.fromEntries(
        Object.entries(request).map(([key, value]) => [
          key,
          value instanceof Date ? value.toISOString() : value,
        ]),
      ),
    );

    const snapshot: Snapshot = {
      info,
      chunks: new Map(),
      filters: structuredClone(filters),
      custId,
      expiresAt: Math.min(member?.expiresAt ?? Infinity, this.now() + 300000),
      bytes: Buffer.byteLength(JSON.stringify({ filters, custId, info })),
    };

    try {
      this.budget.reserve(snapshot.bytes);
    } catch (error) {
      throw error;
    }

    try {
      const result = await this.#page(
        { snapshot, chunk: 0, row: 0 },
        access,
        signal,
      );

      if (result.structuredContent.complete) {
        this.#drop(snapshot);
      }

      return result;
    } catch (error) {
      this.#drop(snapshot);
      throw error;
    }
  }
  /**
   * Resume a retained token, returning a clone of a cached or concurrently pending page.
   * Pending replay shares the first caller's access and signal. Unknown or expired
   * tokens throw CURSOR_EXPIRED; page errors propagate without advancing the offset.
   */
  async resume(
    token: string,
    access: IracingDataAccess,
    signal: AbortSignal,
  ): Promise<Result> {
    this.#prune();
    const entry = this.#entries.get(token);

    if (!entry) {
      collectionExpired();
    }

    if (entry.result) {
      return structuredClone(entry.result);
    }

    if (entry.pending) {
      return structuredClone(await entry.pending);
    }

    const pending = this.#page(entry, access, signal, true);

    entry.pending = pending;
    try {
      return structuredClone(await pending);
    } finally {
      delete entry.pending;
    }
  }
  /**
   * Scan at most four chunks from the saved offset, applying track filters locally.
   * Preserve source order; source_total includes filtered-out rows, and an empty page
   * may be incomplete. Chunk fetch, validation, abort, expiry, and capacity errors
   * propagate. A linked-fetch CURSOR_EXPIRED also disposes the snapshot.
   */
  async #page(
    entry: Cursor,
    access: IracingDataAccess,
    signal: AbortSignal,
    replay = false,
  ): Promise<Result> {
    const snapshot = entry.snapshot;

    let chunk = entry.chunk,
      row = entry.row,
      scanned = 0;

    const items: Record<string, unknown>[] = [];

    const token = randomBytes(32).toString("base64url");

    const { limit: _limit, ...filters } = snapshot.filters;

    const value = (complete: boolean) => ({
      cust_id: snapshot.custId,
      filters: { ...filters, cust_id: snapshot.custId },
      order: "subsession_id",
      items,
      returned_count: items.length,
      complete,
      next_cursor: complete ? null : token,
      source_total: snapshot.info.rows,
    });

    while (
      chunk < snapshot.info.num_chunks &&
      scanned < 4 &&
      items.length < snapshot.filters.limit
    ) {
      let rows = snapshot.chunks.get(chunk);
      if (!rows) {
        try {
          rows = await fetchLinkedJson(
            chunkUrl(
              snapshot.info.base_download_url,
              snapshot.info.chunk_file_names[chunk],
            ).href,
            z.array(z.record(z.string(), z.unknown())),
            signal,
            access.configuration.fetchApi,
          );
        } catch (error) {
          if (
            error instanceof ApplicationFailure &&
            errorEnvelope(error, createRequestContext()).error.code ===
              "CURSOR_EXPIRED"
          )
            this.#drop(snapshot);
          throw error;
        }
        const expected = Math.min(
          snapshot.info.chunk_size,
          snapshot.info.rows - chunk * snapshot.info.chunk_size,
        );
        if (rows.length !== expected)
          throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
        const bytes = Buffer.byteLength(JSON.stringify(rows));
        signal.throwIfAborted();
        if (snapshot.disposed || snapshot.expiresAt <= this.now())
          collectionExpired();
        if (!snapshot.chunks.has(chunk)) {
          this.budget.reserve(bytes);
          if (snapshot.disposed) {
            this.budget.release(bytes);
            collectionExpired();
          }
          snapshot.bytes += bytes;
          snapshot.chunks.set(chunk, rows);
        } else {
          rows = snapshot.chunks.get(chunk)!;
        }
      }

      scanned++;
      while (row < rows.length && items.length < snapshot.filters.limit) {
        const projected = parse(SearchProjection, rows[row]);

        if (
          snapshot.filters.track_ids &&
          !snapshot.filters.track_ids.includes(projected.track.track_id)
        ) {
          row++;
          continue;
        }

        if (!this.#append(items, projected, () => value(false))) {
          return this.#publish(
            entry,
            chunk,
            row,
            completeResult(value(false)),
            token,
            replay,
            signal,
          );
        }

        row++;
      }

      if (row === rows.length) {
        chunk++;
        row = 0;
      }
    }

    const complete = chunk === snapshot.info.num_chunks;

    return this.#publish(
      entry,
      chunk,
      row,
      completeResult(value(complete)),
      token,
      replay,
      signal,
    );
  }
  #append(
    items: Record<string, unknown>[],
    projected: Record<string, unknown>,
    value: () => Record<string, unknown>,
  ): boolean {
    items.push(projected);
    try {
      completeResult(value());

      return true;
    } catch (error) {
      items.pop();
      if (!items.length) {
        throw error;
      }

      return false;
    }
  }
  /**
   * Reserve capacity and publish the next offset, optionally caching this replay result.
   * Return a clone; abort, expiry, and capacity failures propagate before publication.
   */
  #publish(
    entry: Cursor,
    chunk: number,
    row: number,
    result: Result,
    token: string,
    replay: boolean,
    signal: AbortSignal,
  ): Result {
    signal.throwIfAborted();
    if (entry.snapshot.disposed || entry.snapshot.expiresAt <= this.now()) {
      collectionExpired();
    }

    const more = !result.structuredContent.complete;

    const bytes = replay ? Buffer.byteLength(JSON.stringify(result)) : 0;

    this.budget.reserve(bytes, more ? 1 : 0);
    if (entry.snapshot.disposed || entry.snapshot.expiresAt <= this.now()) {
      this.budget.release(bytes, more ? 1 : 0);
      collectionExpired();
    }

    if (more) {
      this.#entries.set(token, { snapshot: entry.snapshot, chunk, row });
    }

    if (replay) {
      entry.result = structuredClone(result);
      entry.resultBytes = bytes;
    }

    return structuredClone(result);
  }
}

const owners = new WeakMap<object, SearchCursors>();
/** Share bounded search state only within the opaque continuation scope. */
export function searchCursors(scope: object): SearchCursors {
  let owner = owners.get(scope);
  if (!owner) {
    owner = new SearchCursors(continuation(scope).budget);
    owners.set(scope, owner);
  }
  return owner;
}
