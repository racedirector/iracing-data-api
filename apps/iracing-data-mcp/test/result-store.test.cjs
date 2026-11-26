/**
 * Canonical storage behavior for the reference result store.
 *
 * These tests exercise real SQLite files in temporary directories: lazy opening,
 * owner binding, canonical hashing, bounded projection reuse, restart, corruption,
 * failed writes and filesystem permissions.
 */
const assert = require("node:assert/strict");
const {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const test = require("node:test");

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      path.join(__dirname, "fixtures", "results", `${name}.json`),
      "utf8",
    ),
  );

const roots = [];
const temporaryDirectory = () => {
  const directory = mkdtempSync(path.join(tmpdir(), "iracing-result-store-"));
  roots.push(directory);
  return directory;
};

test.after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

const OWNER = "owner-scope-fixture";
const CUST = 900001;

async function modules() {
  const store = await import("../dist/results/store.js");
  const canonical = await import("../dist/results/canonical-json.js");
  const mcp = await import("@iracing-data/mcp");
  const { RaceResultPayloadSchema } = await import("@iracing-data/api-schema");
  return { ...store, ...canonical, ...mcp, RaceResultPayloadSchema };
}

async function recordFor(api, name, overrides = {}) {
  const document = api.RaceResultPayloadSchema.parse(fixture(name));
  const provenance = {
    fetchedAt: 1_700_000_000_000,
    revalidateAfter: 1_700_086_400_000,
    contentHash: api.canonicalContentHash(api.serializeCanonicalJson(document)),
  };
  const { projection, json } = api.createRaceResultProjection(
    document,
    provenance,
  );
  const main = document.session_results.find(
    (session) => session.simsession_number === 0,
  );

  return {
    ownerScope: OWNER,
    subsessionId: document.subsession_id,
    sourcePath: "/data/results/get",
    fetchedAt: provenance.fetchedAt,
    revalidateAfter: provenance.revalidateAfter,
    documentJson: JSON.stringify(document),
    projectionJson: json,
    projectionOversized: projection.oversized,
    seriesId: document.series_id ?? null,
    seasonId: document.season_id ?? null,
    raceWeekNum: document.race_week_num ?? null,
    trackId: document.track?.track_id ?? null,
    eventType: document.event_type,
    officialSession: document.official_session ?? null,
    startTime: document.start_time ?? null,
    main,
    ...overrides,
  };
}

test("construction and discovery never create the database", async () => {
  const api = await modules();
  const root = temporaryDirectory();
  const databasePath = path.join(root, "nested", "cache.sqlite");
  const store = new api.ResultStore({ databasePath });
  assert.throws(() => statSync(path.join(root, "nested")), /ENOENT/);
  assert.throws(() => statSync(databasePath), /ENOENT/);
  assert.equal(store.readOwnerBinding(), null);
  assert.ok(statSync(databasePath).isFile());
  store.close();
});

test("stores canonical documents and derived projections with verified hashes", async () => {
  const api = await modules();
  const store = new api.ResultStore({
    databasePath: path.join(temporaryDirectory(), "cache.sqlite"),
  });
  store.bindOwner(OWNER, CUST, 1);

  const write = await recordFor(api, "team-multiclass");
  store.write(write);

  const stored = store.read(OWNER, write.subsessionId);
  assert.ok(stored);
  assert.equal(stored.subsessionId, write.subsessionId);
  assert.equal(stored.schemaVersion, 1);
  assert.equal(stored.projectionVersion, 1);
  assert.equal(stored.eventType, 5);
  assert.equal(stored.seriesId, write.seriesId);
  assert.equal(stored.trackId, 127);
  assert.equal(
    stored.documentHash,
    api.canonicalContentHash(stored.documentJson),
  );
  assert.equal(
    stored.projectionHash,
    api.canonicalContentHash(stored.projectionJson),
  );
  assert.equal(stored.documentBytes, Buffer.byteLength(stored.documentJson));
  assert.equal(
    stored.projectionBytes,
    Buffer.byteLength(stored.projectionJson),
  );
  assert.equal(stored.projection.subsession_id, write.subsessionId);
  assert.equal(stored.lastReadAt, null);

  const stats = store.stats();
  assert.equal(stats.documents, 1);
  assert.equal(stats.totalDocumentBytes, stored.documentBytes);
  assert.equal(stats.totalProjectionBytes, stored.projectionBytes);
  store.close();
});

test("canonical key order is stable and real value changes alter the hash", async () => {
  const api = await modules();
  const left = { z: 1, a: { y: 2, b: [3, { d: 4, c: 5 }] } };
  const right = { a: { b: [3, { c: 5, d: 4 }], y: 2 }, z: 1 };
  assert.equal(
    api.serializeCanonicalJson(left),
    api.serializeCanonicalJson(right),
  );
  assert.equal(
    api.canonicalContentHash(api.serializeCanonicalJson(left)),
    api.canonicalContentHash(api.serializeCanonicalJson(right)),
  );
  assert.notEqual(
    api.canonicalContentHash(api.serializeCanonicalJson(left)),
    api.canonicalContentHash(api.serializeCanonicalJson({ ...left, z: 2 })),
  );
  assert.equal(
    api.serializeCanonicalJson({ b: undefined, a: [undefined] }),
    '{"a":[null]}',
  );
});

test("preserves __proto__ as an own canonical JSON property", async () => {
  const api = await modules();
  const left = JSON.parse('{"__proto__":{"x":1},"a":1}');
  const right = JSON.parse('{"__proto__":{"x":2},"a":1}');
  const serialized = api.serializeCanonicalJson(left);

  assert.match(serialized, /"__proto__"/);
  assert.equal(serialized.includes("x"), true);
  assert.notEqual(
    api.canonicalContentHash(serialized),
    api.canonicalContentHash(api.serializeCanonicalJson(right)),
  );
  assert.deepEqual(JSON.parse(serialized), JSON.parse(serialized));
});

test("rejects a projection that does not belong to the document being written", async () => {
  const api = await modules();
  const store = new api.ResultStore({
    databasePath: path.join(temporaryDirectory(), "cache.sqlite"),
  });
  store.bindOwner(OWNER, CUST, 1);
  const write = await recordFor(api, "individual");
  const projection = JSON.parse(write.projectionJson);
  const mutations = [
    ["fetched_at", projection.fetched_at + 1],
    ["revalidate_after", projection.revalidate_after + 1],
    ["content_hash", `sha256:${"b".repeat(64)}`],
    ["oversized", !projection.oversized],
    ["projection_version", 2],
  ];

  for (const [field, value] of mutations) {
    assert.throws(
      () =>
        store.write({
          ...write,
          projectionJson: JSON.stringify({
            ...projection,
            [field]: value,
          }),
        }),
      (error) => error.code === "DATA_RESOLUTION_FAILED",
      `${field} mismatch should be rejected`,
    );
  }

  assert.equal(store.stats().documents, 0);
  store.write(write);
  assert.equal(store.stats().documents, 1);
  store.close();
});

test("enforces one owner binding across separate store instances", async () => {
  const api = await modules();
  const databasePath = path.join(temporaryDirectory(), "cache.sqlite");
  const first = new api.ResultStore({ databasePath });
  first.bindOwner(OWNER, CUST, 1);
  first.close();

  const second = new api.ResultStore({ databasePath });
  assert.throws(
    () => second.bindOwner("other-owner", CUST + 1, 2),
    (error) => error.code === "CONFIGURATION_ERROR",
  );
  second.bindOwner(OWNER, CUST, 3);
  assert.deepEqual(second.readOwnerBinding(), {
    ownerScope: OWNER,
    custId: CUST,
    boundAt: 1,
  });
  second.close();
});

test("reuses stored projections across close and reopen without upstream work", async () => {
  const api = await modules();
  const databasePath = path.join(temporaryDirectory(), "cache.sqlite");
  const first = new api.ResultStore({ databasePath });
  first.bindOwner(OWNER, CUST, 1);
  const write = await recordFor(api, "individual");
  first.write(write);
  const expected = first.read(OWNER, write.subsessionId);
  first.close();

  const second = new api.ResultStore({ databasePath });
  assert.deepEqual(second.readOwnerBinding(), {
    ownerScope: OWNER,
    custId: CUST,
    boundAt: 1,
  });
  const stored = second.read(OWNER, write.subsessionId);
  assert.ok(stored);
  assert.equal(stored.projectionJson, expected.projectionJson);
  assert.equal(stored.documentHash, expected.documentHash);
  second.close();
});

test("records last_read_at only for stored keys", async () => {
  const api = await modules();
  const store = new api.ResultStore({
    databasePath: path.join(temporaryDirectory(), "cache.sqlite"),
  });
  store.bindOwner(OWNER, CUST, 1);
  const write = await recordFor(api, "timed-partial");
  store.write(write);

  store.touchLastRead(OWNER, write.subsessionId, 42);
  assert.equal(store.read(OWNER, write.subsessionId).lastReadAt, 42);
  assert.throws(
    () => store.touchLastRead(OWNER, 1, 42),
    (error) => error.code === "CONFIGURATION_ERROR",
  );
  store.close();
});

test("fails closed on corrupt, mis-sized or unsupported stored data", async () => {
  const api = await modules();
  const databasePath = path.join(temporaryDirectory(), "cache.sqlite");
  const store = new api.ResultStore({ databasePath });
  store.bindOwner(OWNER, CUST, 1);
  const write = await recordFor(api, "individual");
  store.write(write);
  store.close();

  const { DatabaseSync } = require("node:sqlite");
  const raw = new DatabaseSync(databasePath);
  raw
    .prepare("UPDATE race_result SET document_json = ? WHERE subsession_id = ?")
    .run('{"corrupt":true}', write.subsessionId);
  raw.close();

  const reopened = new api.ResultStore({ databasePath });
  assert.throws(
    () => reopened.read(OWNER, write.subsessionId),
    (error) => error.code === "CONFIGURATION_ERROR",
  );
  reopened.close();

  const secondPath = path.join(temporaryDirectory(), "bytes.sqlite");
  const second = new api.ResultStore({ databasePath: secondPath });
  second.bindOwner(OWNER, CUST, 1);
  second.write(write);
  second.close();
  const rawBytes = new DatabaseSync(secondPath);
  rawBytes
    .prepare(
      "UPDATE race_result SET document_bytes = document_bytes + 1 WHERE subsession_id = ?",
    )
    .run(write.subsessionId);
  rawBytes.close();
  const byteStore = new api.ResultStore({ databasePath: secondPath });
  assert.throws(
    () => byteStore.read(OWNER, write.subsessionId),
    (error) => error.code === "CONFIGURATION_ERROR",
  );
  byteStore.close();

  const thirdPath = path.join(temporaryDirectory(), "version.sqlite");
  const third = new api.ResultStore({ databasePath: thirdPath });
  third.bindOwner(OWNER, CUST, 1);
  third.close();
  const rawVersion = new DatabaseSync(thirdPath);
  rawVersion.exec("PRAGMA user_version = 99");
  rawVersion.close();
  const versionStore = new api.ResultStore({ databasePath: thirdPath });
  assert.throws(
    () => versionStore.readOwnerBinding(),
    (error) => error.code === "CONFIGURATION_ERROR",
  );
});

test("rejects unversioned nonempty databases and symlinked paths", async () => {
  const api = await modules();
  const { DatabaseSync } = require("node:sqlite");

  const legacyPath = path.join(temporaryDirectory(), "legacy.sqlite");
  const legacy = new DatabaseSync(legacyPath);
  legacy.exec("CREATE TABLE unrelated (id INTEGER)");
  legacy.close();
  const legacyStore = new api.ResultStore({ databasePath: legacyPath });
  assert.throws(
    () => legacyStore.readOwnerBinding(),
    (error) => error.code === "CONFIGURATION_ERROR",
  );

  const root = temporaryDirectory();
  const target = path.join(root, "target.sqlite");
  const link = path.join(root, "link.sqlite");
  const targetDb = new DatabaseSync(target);
  targetDb.close();
  symlinkSync(target, link);
  const linkStore = new api.ResultStore({ databasePath: link });
  assert.throws(
    () => linkStore.readOwnerBinding(),
    (error) => error.code === "CONFIGURATION_ERROR",
  );
});

test("rejects identity mismatches, duplicate owners and over-limit payloads atomically", async () => {
  const api = await modules();
  const store = new api.ResultStore({
    databasePath: path.join(temporaryDirectory(), "cache.sqlite"),
  });
  store.bindOwner(OWNER, CUST, 1);
  const write = await recordFor(api, "practice-only");

  const mismatchedDocument = structuredClone(
    api.RaceResultPayloadSchema.parse(fixture("practice-only")),
  );
  mismatchedDocument.subsession_id += 1;
  assert.throws(
    () =>
      store.write({
        ...write,
        documentJson: JSON.stringify(mismatchedDocument),
      }),
    (error) => error.code === "DATA_RESOLUTION_FAILED",
  );
  assert.equal(store.read(OWNER, write.subsessionId), null);

  assert.throws(
    () => store.bindOwner("other-owner", CUST + 1, 2),
    (error) => error.code === "CONFIGURATION_ERROR",
  );

  assert.throws(
    () =>
      store.write({
        ...write,
        projectionJson: JSON.stringify({
          ...JSON.parse(write.projectionJson),
          filler: "x".repeat(70_000),
        }),
      }),
    (error) => error.code === "RESPONSE_LIMIT_EXCEEDED",
  );
  assert.equal(store.read(OWNER, write.subsessionId), null);

  assert.throws(
    () =>
      store.write({
        ...write,
        documentJson: JSON.stringify({
          ...JSON.parse(write.documentJson),
          filler: "x".repeat(2 * 1024 * 1024),
        }),
      }),
    (error) => error.code === "RESPONSE_LIMIT_EXCEEDED",
  );

  store.write(write);
  const before = store.read(OWNER, write.subsessionId);
  assert.throws(() => store.write({ ...write, ownerScope: "missing-owner" }), {
    message: /FOREIGN KEY|constraint/i,
  });
  assert.deepEqual(store.read(OWNER, write.subsessionId), before);
  store.close();
});

test("creates owner-only directories and files", async () => {
  const api = await modules();
  const root = temporaryDirectory();
  const databasePath = path.join(root, "owner", "cache.sqlite");
  const store = new api.ResultStore({ databasePath });
  store.bindOwner(OWNER, CUST, 1);
  store.close();

  if (process.platform === "win32") {
    assert.ok(statSync(path.dirname(databasePath)).isDirectory());
    assert.ok(statSync(databasePath).isFile());
  } else {
    assert.equal(statSync(path.dirname(databasePath)).mode & 0o777, 0o700);
    assert.equal(statSync(databasePath).mode & 0o777, 0o600);
  }
});

test("stats report document and projection bytes separately", async () => {
  const api = await modules();
  const store = new api.ResultStore({
    databasePath: path.join(temporaryDirectory(), "cache.sqlite"),
  });
  store.bindOwner(OWNER, CUST, 1);
  for (const name of ["individual", "league-heats", "dirt-heats"]) {
    store.write(await recordFor(api, name));
  }
  const stats = store.stats();
  assert.equal(stats.documents, 3);
  assert.ok(stats.totalDocumentBytes > stats.totalProjectionBytes);
  assert.equal(stats.oversizedProjections, 0);
  store.close();
});
