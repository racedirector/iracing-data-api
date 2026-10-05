import { randomBytes } from "node:crypto";
import { z } from "zod";
import { parse } from "../gateway/parsers.js";
import { collectionExpired, completeResult } from "./collections.js";
import { SearchInitialInput, SearchProjection } from "./contracts.js";
import type {
  DataApiGateway,
  GatewayCall,
  GatewaySearch,
} from "../gateway/gateway.js";

type Filters = z.infer<typeof SearchInitialInput>;
type Result = ReturnType<typeof completeResult>;
interface Snapshot {
  handle: GatewaySearch;
  filters: Filters;
  custId: number;
  generation: number;
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
  constructor(
    readonly gateway: DataApiGateway,
    readonly now: () => number = Date.now,
  ) {
    gateway.retention.registerPruner(() => this.#prune());
  }
  #prune() {
    const expired = new Set<Snapshot>();

    for (const entry of this.#entries.values()) {
      if (
        entry.snapshot.disposed ||
        entry.snapshot.generation !== this.gateway.generation ||
        entry.snapshot.expiresAt <= this.now() ||
        !this.gateway.hasSearch(entry.snapshot.handle)
      ) {
        expired.add(entry.snapshot);
      }
    }

    for (const snapshot of expired) {
      this.#drop(snapshot);
    }
  }
  #drop(snapshot: Snapshot) {
    if (snapshot.disposed) {
      return;
    }

    snapshot.disposed = true;
    for (const [token, entry] of this.#entries) {
      if (entry.snapshot === snapshot) {
        this.gateway.retention.release(entry.resultBytes ?? 0, 1);
        this.#entries.delete(token);
      }
    }

    this.gateway.retention.release(snapshot.bytes);
    this.gateway.releaseSearch(snapshot.handle);
  }
  async start(
    filters: Filters,
    call: GatewayCall,
    signal: AbortSignal,
  ): Promise<Result> {
    this.#prune();
    const custId =
      filters.cust_id ??
      parse(z.number().int().positive().safe(), (await call.member()).cust_id);

    const range = filters.range;

    const handle = await call.search({
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
    });

    const snapshot: Snapshot = {
      handle,
      filters: structuredClone(filters),
      custId,
      generation: this.gateway.generation,
      expiresAt: Math.min(
        handle.expiresAt,
        call.expiresAt,
        this.now() + 300000,
      ),
      bytes: Buffer.byteLength(JSON.stringify({ filters, custId })),
    };

    try {
      this.gateway.retention.reserve(snapshot.bytes);
    } catch (error) {
      this.gateway.releaseSearch(handle);
      throw error;
    }

    try {
      const result = await this.#page(
        { snapshot, chunk: 0, row: 0 },
        call,
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
  async resume(
    token: string,
    call: GatewayCall,
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

    const pending = this.#page(entry, call, signal, true);

    entry.pending = pending;
    try {
      return structuredClone(await pending);
    } finally {
      delete entry.pending;
    }
  }
  async #page(
    entry: Cursor,
    call: GatewayCall,
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
      source_total: snapshot.handle.totalRows,
    });

    while (
      chunk < snapshot.handle.chunks &&
      scanned < 4 &&
      items.length < snapshot.filters.limit
    ) {
      const rows = await call.chunk(snapshot.handle, chunk);

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

    const complete = chunk === snapshot.handle.chunks;

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
    if (
      entry.snapshot.disposed ||
      entry.snapshot.generation !== this.gateway.generation ||
      entry.snapshot.expiresAt <= this.now() ||
      !this.gateway.hasSearch(entry.snapshot.handle)
    ) {
      collectionExpired();
    }

    const more = !result.structuredContent.complete;

    const bytes = replay ? Buffer.byteLength(JSON.stringify(result)) : 0;

    this.gateway.retention.reserve(bytes, more ? 1 : 0);
    if (
      entry.snapshot.disposed ||
      entry.snapshot.expiresAt <= this.now() ||
      !this.gateway.hasSearch(entry.snapshot.handle)
    ) {
      this.gateway.retention.release(bytes, more ? 1 : 0);
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
