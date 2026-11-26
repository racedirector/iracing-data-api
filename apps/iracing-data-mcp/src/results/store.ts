/**
 * Owner-partitioned SQLite storage for canonical race-result documents.
 *
 * The canonical document and a small derived projection are stored together with
 * provenance and pruning signals. Storage is deliberately small: no participant,
 * team, session or track indexes in schema version 1. Opening is lazy so
 * discovery and construction never touch the filesystem.
 *
 * `node:sqlite` is synchronous, so callers must parse, validate, canonicalize and
 * project before opening a write transaction. No network I/O or JSON work belongs
 * inside a transaction here.
 */
import { chmodSync, closeSync, lstatSync, mkdirSync, openSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  RACE_RESULT_PROJECTION_VERSION,
  RACE_RESULT_RESOURCE_BYTE_LIMIT,
} from "@iracing-data/mcp";
import {
  MAX_CANONICAL_DOCUMENT_BYTES,
  canonicalContentHash,
  serializeCanonicalJson,
  utf8ByteLength,
} from "./canonical-json.js";

/** Storage schema version understood by this module. */
export const RESULT_STORE_SCHEMA_VERSION = 1;

/** Stable, secret-safe store failure codes for host mapping. */
export type ResultStoreErrorCode =
  "CONFIGURATION_ERROR" | "RESPONSE_LIMIT_EXCEEDED" | "DATA_RESOLUTION_FAILED";

/** Store failure carrying a bounded code instead of SQLite detail. */
export class ResultStoreError extends Error {
  /** Stable failure code. */
  readonly code: ResultStoreErrorCode;

  /**
   * Create a bounded store failure.
   *
   * @param {ResultStoreErrorCode} code - Bounded failure code.
   * @param {string} message - Non-secret operator-facing summary.
   */
  constructor(code: ResultStoreErrorCode, message: string) {
    super(message);
    this.name = "ResultStoreError";
    this.code = code;
  }
}

/** Verified credential-owner binding. */
export interface ResultOwnerBinding {
  /** Nonsecret opaque owner partition. */
  readonly ownerScope: string;

  /** Verified upstream customer identity. */
  readonly custId: number;

  /** Epoch milliseconds when the binding was verified. */
  readonly boundAt: number;
}

/** Input for writing one canonical result and its derived projection. */
export interface RaceResultWrite {
  /** Owner partition receiving the record. */
  readonly ownerScope: string;

  /** Requested and stored subsession identity. */
  readonly subsessionId: number;

  /** Upstream path that produced the document. */
  readonly sourcePath: string;

  /** Epoch milliseconds of the successful fetch. */
  readonly fetchedAt: number;

  /** Epoch milliseconds after which revalidation is required. */
  readonly revalidateAfter: number;

  /** Complete result document JSON; canonicalized by the store. */
  readonly documentJson: string;

  /** Derived bounded projection JSON. */
  readonly projectionJson: string;

  /** Whether the projection is the explicit oversized summary. */
  readonly projectionOversized: boolean;

  /** Series identity, or null when unavailable. Zero is a hosted sentinel. */
  readonly seriesId: number | null;

  /** Season identity, or null when unavailable. Zero is a hosted sentinel. */
  readonly seasonId: number | null;

  /** Race week within the season, or null. */
  readonly raceWeekNum: number | null;

  /** Track identity from `track.track_id`, or null. */
  readonly trackId: number | null;

  /** Upstream event type. */
  readonly eventType: number;

  /** Whether the session was official, or null when omitted upstream. */
  readonly officialSession: boolean | null;

  /** Upstream session start text, or null. */
  readonly startTime: string | null;
}

/** Stored record with verified integrity. */
export interface StoredRaceResult {
  /** Owner partition of the record. */
  readonly ownerScope: string;

  /** Stored subsession identity. */
  readonly subsessionId: number;

  /** Upstream path that produced the document. */
  readonly sourcePath: string;

  /** Storage schema version. */
  readonly schemaVersion: number;

  /** Projection schema version. */
  readonly projectionVersion: number;

  /** Epoch milliseconds of the last successful fetch. */
  readonly fetchedAt: number;

  /** Epoch milliseconds after which revalidation is required. */
  readonly revalidateAfter: number;

  /** Canonical document byte length. */
  readonly documentBytes: number;

  /** Canonical document content hash. */
  readonly documentHash: string;

  /** Projection byte length. */
  readonly projectionBytes: number;

  /** Projection content hash. */
  readonly projectionHash: string;

  /** Whether the projection is the explicit oversized summary. */
  readonly projectionOversized: boolean;

  /** Series identity, or null when unavailable. */
  readonly seriesId: number | null;

  /** Season identity, or null when unavailable. */
  readonly seasonId: number | null;

  /** Race week within the season, or null. */
  readonly raceWeekNum: number | null;

  /** Track identity, or null. */
  readonly trackId: number | null;

  /** Upstream event type. */
  readonly eventType: number;

  /** Whether the session was official, or null when omitted upstream. */
  readonly officialSession: boolean | null;

  /** Upstream session start text, or null. */
  readonly startTime: string | null;

  /** Epoch milliseconds of the last successful read, or null. */
  readonly lastReadAt: number | null;

  /** Epoch milliseconds of the last revalidation attempt, or null. */
  readonly lastRevalidationAt: number | null;

  /** Bounded outcome label of the last revalidation attempt, or null. */
  readonly lastRevalidationOutcome: string | null;

  /** Epoch milliseconds when an amendment was last observed, or null. */
  readonly lastAmendedAt: number | null;

  /** Number of completed revalidation attempts. */
  readonly revalidationCount: number;

  /** Number of observed content amendments. */
  readonly amendmentCount: number;

  /** Canonical compact document JSON. */
  readonly documentJson: string;

  /** Compact derived projection JSON. */
  readonly projectionJson: string;

  /** Parsed projection; schema validation belongs to the resource boundary. */
  readonly projection: unknown;
}

/** Aggregate storage measurements for the Phase 1 report. */
export interface ResultStoreStats {
  /** Number of stored documents. */
  readonly documents: number;

  /** Total canonical document bytes. */
  readonly totalDocumentBytes: number;

  /** Total projection bytes. */
  readonly totalProjectionBytes: number;

  /** Number of stored oversized-summary projections. */
  readonly oversizedProjections: number;
}

/** Options for the reference store. */
export interface ResultStoreOptions {
  /** Absolute database path inside an owner-only directory. */
  readonly databasePath: string;

  /** SQLite busy timeout in milliseconds. */
  readonly busyTimeoutMs?: number;
}

interface StoredRow {
  owner_scope: string;
  subsession_id: number;
  source_path: string;
  schema_version: number;
  projection_version: number;
  fetched_at: number;
  revalidate_after: number;
  document_bytes: number;
  document_hash: string;
  projection_bytes: number;
  projection_hash: string;
  projection_oversized: number;
  series_id: number | null;
  season_id: number | null;
  race_week_num: number | null;
  track_id: number | null;
  event_type: number;
  official_session: number | null;
  start_time: string | null;
  last_read_at: number | null;
  last_revalidation_at: number | null;
  last_revalidation_outcome: string | null;
  last_amended_at: number | null;
  revalidation_count: number;
  amendment_count: number;
  document_json: string;
  projection_json: string;
}

const schemaSql = `
CREATE TABLE owner_binding (
  owner_scope TEXT PRIMARY KEY NOT NULL,
  cust_id INTEGER NOT NULL,
  bound_at INTEGER NOT NULL
);
CREATE TABLE race_result (
  owner_scope TEXT NOT NULL,
  subsession_id INTEGER NOT NULL,
  source_path TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  projection_version INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL,
  revalidate_after INTEGER NOT NULL,
  document_bytes INTEGER NOT NULL,
  document_hash TEXT NOT NULL,
  projection_bytes INTEGER NOT NULL,
  projection_hash TEXT NOT NULL,
  projection_oversized INTEGER NOT NULL,
  series_id INTEGER,
  season_id INTEGER,
  race_week_num INTEGER,
  track_id INTEGER,
  event_type INTEGER NOT NULL,
  official_session INTEGER,
  start_time TEXT,
  last_read_at INTEGER,
  last_revalidation_at INTEGER,
  last_revalidation_outcome TEXT,
  last_amended_at INTEGER,
  revalidation_count INTEGER NOT NULL DEFAULT 0,
  amendment_count INTEGER NOT NULL DEFAULT 0,
  document_json TEXT NOT NULL,
  projection_json TEXT NOT NULL,
  PRIMARY KEY (owner_scope, subsession_id),
  FOREIGN KEY (owner_scope) REFERENCES owner_binding(owner_scope)
);
`;

const upsertSql = `
INSERT INTO race_result (
  owner_scope, subsession_id, source_path, schema_version, projection_version,
  fetched_at, revalidate_after, document_bytes, document_hash, projection_bytes,
  projection_hash, projection_oversized, series_id, season_id, race_week_num,
  track_id, event_type, official_session, start_time, document_json,
  projection_json
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
ON CONFLICT(owner_scope, subsession_id) DO UPDATE SET
  source_path = excluded.source_path,
  schema_version = excluded.schema_version,
  projection_version = excluded.projection_version,
  fetched_at = excluded.fetched_at,
  revalidate_after = excluded.revalidate_after,
  document_bytes = excluded.document_bytes,
  document_hash = excluded.document_hash,
  projection_bytes = excluded.projection_bytes,
  projection_hash = excluded.projection_hash,
  projection_oversized = excluded.projection_oversized,
  series_id = excluded.series_id,
  season_id = excluded.season_id,
  race_week_num = excluded.race_week_num,
  track_id = excluded.track_id,
  event_type = excluded.event_type,
  official_session = excluded.official_session,
  start_time = excluded.start_time,
  document_json = excluded.document_json,
  projection_json = excluded.projection_json
`;

function assertOwnerOnlyPath(databasePath: string): void {
  const directory = dirname(databasePath);

  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const directoryStat = lstatSync(directory);

  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) {
    throw new ResultStoreError(
      "CONFIGURATION_ERROR",
      "Result store directory is not a regular directory.",
    );
  }

  if (
    typeof process.getuid === "function" &&
    directoryStat.uid !== process.getuid()
  ) {
    throw new ResultStoreError(
      "CONFIGURATION_ERROR",
      "Result store directory is not owned by this process.",
    );
  }

  chmodSync(directory, 0o700);

  try {
    const fileStat = lstatSync(databasePath);

    if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
      throw new ResultStoreError(
        "CONFIGURATION_ERROR",
        "Result store path is not a regular file.",
      );
    }

    if (
      typeof process.getuid === "function" &&
      fileStat.uid !== process.getuid()
    ) {
      throw new ResultStoreError(
        "CONFIGURATION_ERROR",
        "Result store file is not owned by this process.",
      );
    }
  } catch (error) {
    if (
      error instanceof ResultStoreError ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error;
    }

    const handle = openSync(databasePath, "wx", 0o600);

    closeSync(handle);
  }

  chmodSync(databasePath, 0o600);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new ResultStoreError(
      "DATA_RESOLUTION_FAILED",
      "Stored result data is not valid JSON.",
    );
  }
}

function subsessionIdOf(value: unknown, expected: number): void {
  if (
    typeof value !== "object" ||
    value === null ||
    (value as { subsession_id?: unknown }).subsession_id !== expected
  ) {
    throw new ResultStoreError(
      "DATA_RESOLUTION_FAILED",
      "Stored result identity does not match its key.",
    );
  }
}

interface CanonicalWrite {
  readonly documentJson: string;
  readonly documentBytes: number;
  readonly documentHash: string;
  readonly projectionJson: string;
  readonly projectionBytes: number;
  readonly projectionHash: string;
}

function canonicalWrite(write: RaceResultWrite): CanonicalWrite {
  if (
    write.ownerScope.length === 0 ||
    !Number.isSafeInteger(write.subsessionId) ||
    write.subsessionId <= 0
  ) {
    throw new ResultStoreError(
      "DATA_RESOLUTION_FAILED",
      "Result key is malformed.",
    );
  }

  const document = parseJson(write.documentJson);

  subsessionIdOf(document, write.subsessionId);
  const documentJson = serializeCanonicalJson(document);

  const documentBytes = utf8ByteLength(documentJson);

  if (documentBytes > MAX_CANONICAL_DOCUMENT_BYTES) {
    throw new ResultStoreError(
      "RESPONSE_LIMIT_EXCEEDED",
      "Canonical result document exceeds the storage ceiling.",
    );
  }

  const projection = parseJson(write.projectionJson);

  subsessionIdOf(projection, write.subsessionId);
  const projectionJson = serializeCanonicalJson(projection);

  const projectionBytes = utf8ByteLength(projectionJson);

  if (projectionBytes > RACE_RESULT_RESOURCE_BYTE_LIMIT) {
    throw new ResultStoreError(
      "RESPONSE_LIMIT_EXCEEDED",
      "Result projection exceeds the resource ceiling.",
    );
  }

  return {
    documentJson,
    documentBytes,
    documentHash: canonicalContentHash(documentJson),
    projectionJson,
    projectionBytes,
    projectionHash: canonicalContentHash(projectionJson),
  };
}

function rowToRecord(row: StoredRow, subsessionId: number): StoredRaceResult {
  if (
    row.schema_version !== RESULT_STORE_SCHEMA_VERSION ||
    row.projection_version !== RACE_RESULT_PROJECTION_VERSION
  ) {
    throw new ResultStoreError(
      "CONFIGURATION_ERROR",
      "Stored result uses an unsupported schema version.",
    );
  }

  if (
    row.document_bytes !== utf8ByteLength(row.document_json) ||
    row.document_hash !== canonicalContentHash(row.document_json) ||
    row.projection_bytes !== utf8ByteLength(row.projection_json) ||
    row.projection_hash !== canonicalContentHash(row.projection_json)
  ) {
    throw new ResultStoreError(
      "CONFIGURATION_ERROR",
      "Stored result failed integrity verification.",
    );
  }

  const projection = parseJson(row.projection_json);

  subsessionIdOf(projection, subsessionId);

  return {
    ownerScope: row.owner_scope,
    subsessionId: row.subsession_id,
    sourcePath: row.source_path,
    schemaVersion: row.schema_version,
    projectionVersion: row.projection_version,
    fetchedAt: row.fetched_at,
    revalidateAfter: row.revalidate_after,
    documentBytes: row.document_bytes,
    documentHash: row.document_hash,
    projectionBytes: row.projection_bytes,
    projectionHash: row.projection_hash,
    projectionOversized: row.projection_oversized === 1,
    seriesId: row.series_id,
    seasonId: row.season_id,
    raceWeekNum: row.race_week_num,
    trackId: row.track_id,
    eventType: row.event_type,
    officialSession:
      row.official_session === null ? null : row.official_session === 1,
    startTime: row.start_time,
    lastReadAt: row.last_read_at,
    lastRevalidationAt: row.last_revalidation_at,
    lastRevalidationOutcome: row.last_revalidation_outcome,
    lastAmendedAt: row.last_amended_at,
    revalidationCount: row.revalidation_count,
    amendmentCount: row.amendment_count,
    documentJson: row.document_json,
    projectionJson: row.projection_json,
    projection,
  };
}

/**
 * Owner-partitioned result store. All methods are synchronous and open the
 * database lazily on first use.
 */
export class ResultStore {
  readonly #databasePath: string;
  readonly #busyTimeoutMs: number;
  #database: DatabaseSync | null = null;
  #closed = false;

  /**
   * Create a lazily opened store.
   *
   * @param {ResultStoreOptions} options - Database path and optional busy timeout.
   */
  constructor(options: ResultStoreOptions) {
    this.#databasePath = options.databasePath;
    this.#busyTimeoutMs = options.busyTimeoutMs ?? 5_000;
  }

  /**
   * Path of the SQLite database.
   *
   * @returns {string} Configured absolute database path.
   */
  get databasePath(): string {
    return this.#databasePath;
  }

  /**
   * Open, verify and migrate the database on first use.
   *
   * @returns {DatabaseSync} Open database handle.
   * @throws {ResultStoreError} When the file, schema or integrity check fails.
   */
  #open(): DatabaseSync {
    if (this.#closed) {
      throw new ResultStoreError(
        "CONFIGURATION_ERROR",
        "Result store is closed.",
      );
    }

    if (this.#database) {
      return this.#database;
    }

    assertOwnerOnlyPath(this.#databasePath);

    const database = new DatabaseSync(this.#databasePath, {
      timeout: this.#busyTimeoutMs,
    });

    try {
      database.exec("PRAGMA journal_mode = WAL");
      database.exec("PRAGMA synchronous = FULL");
      database.exec("PRAGMA foreign_keys = ON");

      const check = database.prepare("PRAGMA quick_check").get() as
        { quick_check?: string } | undefined;

      if (check?.quick_check !== "ok") {
        throw new ResultStoreError(
          "CONFIGURATION_ERROR",
          "Result store failed its integrity check.",
        );
      }

      this.#migrate(database);
      this.#database = database;

      return database;
    } catch (error) {
      database.close();
      throw error;
    }
  }

  #migrate(database: DatabaseSync): void {
    const version = (
      database.prepare("PRAGMA user_version").get() as { user_version: number }
    ).user_version;

    if (version > RESULT_STORE_SCHEMA_VERSION) {
      throw new ResultStoreError(
        "CONFIGURATION_ERROR",
        "Result store schema is newer than this host supports.",
      );
    }

    if (version === RESULT_STORE_SCHEMA_VERSION) {
      return;
    }

    const existing = database
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
      )
      .all() as { name: string }[];

    if (existing.length > 0) {
      throw new ResultStoreError(
        "CONFIGURATION_ERROR",
        "Unrecognized result store schema at version zero.",
      );
    }

    database.exec("BEGIN IMMEDIATE");
    try {
      database.exec(schemaSql);
      database.exec(
        `PRAGMA user_version = ${String(RESULT_STORE_SCHEMA_VERSION)}`,
      );
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  /**
   * Bind this database to one verified owner scope.
   *
   * @param {string} ownerScope - Nonsecret opaque owner partition.
   * @param {number} custId - Verified upstream customer identity.
   * @param {number} boundAt - Epoch milliseconds of verification.
   * @throws {ResultStoreError} When the store is already bound to another identity.
   */
  bindOwner(ownerScope: string, custId: number, boundAt: number): void {
    if (ownerScope.length === 0 || !Number.isSafeInteger(custId)) {
      throw new ResultStoreError(
        "DATA_RESOLUTION_FAILED",
        "Owner binding is malformed.",
      );
    }

    const database = this.#open();

    const existing = database
      .prepare("SELECT owner_scope, cust_id FROM owner_binding LIMIT 1")
      .get() as { owner_scope: string; cust_id: number } | undefined;

    if (existing) {
      if (existing.owner_scope !== ownerScope || existing.cust_id !== custId) {
        throw new ResultStoreError(
          "CONFIGURATION_ERROR",
          "Result store is bound to a different upstream identity.",
        );
      }

      return;
    }

    database
      .prepare(
        "INSERT INTO owner_binding (owner_scope, cust_id, bound_at) VALUES (?, ?, ?)",
      )
      .run(ownerScope, custId, boundAt);
  }

  /**
   * Read the single owner binding, when one has been established.
   *
   * @returns {ResultOwnerBinding | null} Verified binding or null.
   */
  readOwnerBinding(): ResultOwnerBinding | null {
    const row = this.#open()
      .prepare(
        "SELECT owner_scope, cust_id, bound_at FROM owner_binding LIMIT 1",
      )
      .get() as
      { owner_scope: string; cust_id: number; bound_at: number } | undefined;

    return row
      ? {
          ownerScope: row.owner_scope,
          custId: row.cust_id,
          boundAt: row.bound_at,
        }
      : null;
  }

  /**
   * Canonicalize, verify and upsert one result in a short transaction.
   *
   * @param {RaceResultWrite} write - Canonical documents and provenance.
   * @throws {ResultStoreError} When the key, identity, size or write fails.
   */
  write(write: RaceResultWrite): void {
    const canonical = canonicalWrite(write);

    let officialSession: number | null = null;

    if (write.officialSession !== null) {
      officialSession = write.officialSession ? 1 : 0;
    }

    const database = this.#open();

    database.exec("BEGIN IMMEDIATE");
    try {
      database
        .prepare(upsertSql)
        .run(
          write.ownerScope,
          write.subsessionId,
          write.sourcePath,
          RESULT_STORE_SCHEMA_VERSION,
          RACE_RESULT_PROJECTION_VERSION,
          write.fetchedAt,
          write.revalidateAfter,
          canonical.documentBytes,
          canonical.documentHash,
          canonical.projectionBytes,
          canonical.projectionHash,
          write.projectionOversized ? 1 : 0,
          write.seriesId,
          write.seasonId,
          write.raceWeekNum,
          write.trackId,
          write.eventType,
          officialSession,
          write.startTime,
          canonical.documentJson,
          canonical.projectionJson,
        );
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  /**
   * Read and verify one stored result. Returns null for an absent key.
   *
   * Integrity failures (versions, byte counts, hashes, projection identity) fail
   * closed rather than being treated as a cache miss.
   *
   * @param {string} ownerScope - Owner partition to read.
   * @param {number} subsessionId - Requested subsession identity.
   * @returns {StoredRaceResult | null} Verified record or null.
   * @throws {ResultStoreError} When stored data fails integrity verification.
   */
  read(ownerScope: string, subsessionId: number): StoredRaceResult | null {
    const row = this.#open()
      .prepare(
        "SELECT * FROM race_result WHERE owner_scope = ? AND subsession_id = ?",
      )
      .get(ownerScope, subsessionId) as StoredRow | undefined;

    return row ? rowToRecord(row, subsessionId) : null;
  }

  /**
   * Record a successful materialized read.
   *
   * @param {string} ownerScope - Owner partition.
   * @param {number} subsessionId - Read subsession identity.
   * @param {number} at - Epoch milliseconds.
   * @throws {ResultStoreError} When the read cannot be recorded.
   */
  touchLastRead(ownerScope: string, subsessionId: number, at: number): void {
    const result = this.#open()
      .prepare(
        "UPDATE race_result SET last_read_at = ? WHERE owner_scope = ? AND subsession_id = ?",
      )
      .run(at, ownerScope, subsessionId);

    if (result.changes !== 1) {
      throw new ResultStoreError(
        "CONFIGURATION_ERROR",
        "Result read could not be recorded.",
      );
    }
  }

  /**
   * Aggregate measurements used by the storage report.
   *
   * @returns {ResultStoreStats} Current document, projection and oversize totals.
   * @throws {ResultStoreError} When the database cannot be opened.
   */
  stats(): ResultStoreStats {
    const row = this.#open()
      .prepare(
        `SELECT
           COUNT(*) AS documents,
           COALESCE(SUM(document_bytes), 0) AS document_bytes,
           COALESCE(SUM(projection_bytes), 0) AS projection_bytes,
           COALESCE(SUM(projection_oversized), 0) AS oversized
         FROM race_result`,
      )
      .get() as {
      documents: number;
      document_bytes: number;
      projection_bytes: number;
      oversized: number;
    };

    return {
      documents: row.documents,
      totalDocumentBytes: row.document_bytes,
      totalProjectionBytes: row.projection_bytes,
      oversizedProjections: row.oversized,
    };
  }

  /** Close the database handle. Idempotent. */
  close(): void {
    if (this.#database) {
      this.#database.close();
      this.#database = null;
    }

    this.#closed = true;
  }
}
