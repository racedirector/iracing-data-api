import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const { DiskStore, InMemoryStore } = createRequire(import.meta.url)(
  "../dist/index.js",
);

for (const kind of ["memory", "disk"]) {
  test(`${kind} store preserves null, overwrites, deletes, and clears`, (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oauth-store-"));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const file = path.join(dir, "sessions.json");
    const store = kind === "memory" ? new InMemoryStore() : new DiskStore(file);
    assert.equal(store.get("missing"), undefined);
    store.set("session", null);
    assert.equal(store.get("session"), null);
    store.set("session", { access_token: "fixture-token" });
    assert.deepEqual(store.get("session"), { access_token: "fixture-token" });
    if (kind === "disk")
      assert.deepEqual(
        new DiskStore(file).get("session"),
        store.get("session"),
      );
    store.del("session");
    assert.equal(store.get("session"), undefined);
    store.set("other", "fixture");
    store.clear();
    assert.equal(store.get("other"), undefined);
    if (kind === "disk")
      assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), {});
  });
}

test("disk store reports malformed persisted input and starts empty", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oauth-store-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "synthetic-private-path.json");
  fs.writeFileSync(file, '{"access_token":"synthetic-secret"');
  const warnings = [];
  t.mock.method(console, "warn", (...args) => warnings.push(args));
  assert.equal(new DiskStore(file).get("session"), undefined);
  assert.equal(warnings.length, 1);
  assert.deepEqual(warnings[0], [
    "[SimpleDiskStorage] Failed to load store. Check the configured file's permissions and JSON format; starting with an empty store.",
  ]);
});

test("disk store propagates persistence failure", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oauth-store-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const warnings = [];
  t.mock.method(console, "warn", (...args) => warnings.push(args));
  const store = new DiskStore(path.join(dir, "missing", "sessions.json"));
  assert.throws(() => store.set("session", "fixture"), { code: "ENOENT" });
  assert.deepEqual(warnings, [
    [
      "[SimpleDiskStorage] Failed to persist store. Check that the configured directory exists and the file is writable.",
    ],
  ]);
});

test("disk store does not log credential-bearing serialization errors", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oauth-store-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const warnings = [];
  t.mock.method(console, "warn", (...args) => warnings.push(args));
  const store = new DiskStore(path.join(dir, "sessions.json"));
  const error = new Error("synthetic-access-token synthetic-refresh-token");
  const value = {
    toJSON() {
      throw error;
    },
  };
  assert.throws(
    () => store.set("session", value),
    (caught) => caught === error,
  );
  assert.deepEqual(warnings, [
    [
      "[SimpleDiskStorage] Failed to persist store. Check that the configured directory exists and the file is writable.",
    ],
  ]);
});
