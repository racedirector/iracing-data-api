import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { diffTrees } from "./check-generated.mjs";

test("freshness detects modified, missing, extra, and obsolete output", (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "generated-diff-test-"),
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const expected = path.join(directory, "committed");
  const actual = path.join(directory, "regenerated");
  for (const target of [expected, actual]) fs.mkdirSync(target);
  fs.writeFileSync(path.join(expected, "changed.ts"), "old");
  fs.writeFileSync(path.join(actual, "changed.ts"), "new");
  fs.writeFileSync(path.join(expected, "obsolete.ts"), "removed upstream");
  fs.writeFileSync(path.join(actual, "missing.ts"), "new upstream");
  assert.deepEqual(diffTrees(expected, actual), [
    "changed.ts",
    "missing.ts",
    "obsolete.ts",
  ]);
});

test("authored guidance/build output is excluded but generator bookkeeping is checked", (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "generated-scope-test-"),
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const expected = path.join(directory, "committed");
  const actual = path.join(directory, "regenerated");
  for (const target of [expected, actual]) {
    fs.mkdirSync(path.join(target, ".openapi-generator"), { recursive: true });
    fs.writeFileSync(
      path.join(target, ".openapi-generator", "FILES"),
      "src/file.ts\n",
    );
  }
  fs.writeFileSync(path.join(expected, "AGENTS.md"), "authored");
  fs.mkdirSync(path.join(expected, "dist"));
  fs.writeFileSync(path.join(expected, "dist", "index.js"), "compiled");
  fs.mkdirSync(path.join(expected, "examples"));
  fs.writeFileSync(
    path.join(expected, "examples", "demo.rs"),
    "authored Rust example",
  );
  assert.deepEqual(diffTrees(expected, actual), []);
  fs.writeFileSync(
    path.join(actual, ".openapi-generator", "FILES"),
    "src/new.ts\n",
  );
  assert.deepEqual(diffTrees(expected, actual), [".openapi-generator/FILES"]);
});

test("generated symlinks fail closed", (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "generated-link-test-"),
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.symlinkSync(path.join(directory, "outside"), path.join(directory, "link"));
  assert.throws(() => diffTrees(directory, directory), /symlink/);
});
