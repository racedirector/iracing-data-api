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
  const file = path.join(dir, "sessions.json");
  fs.writeFileSync(file, "broken JSON");
  const warnings = [];
  t.mock.method(console, "warn", (...args) => warnings.push(args));
  assert.equal(new DiskStore(file).get("session"), undefined);
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0][1] instanceof SyntaxError);
});

test("disk store propagates persistence failure", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oauth-store-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  t.mock.method(console, "warn", () => {});
  const store = new DiskStore(path.join(dir, "missing", "sessions.json"));
  assert.throws(() => store.set("session", "fixture"), { code: "ENOENT" });
});
