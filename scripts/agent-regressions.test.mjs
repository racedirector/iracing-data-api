import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { root, run, validateSuite } from "./agent-regressions.mjs";
import { verificationPlan } from "./verify.mjs";

const suite = JSON.parse(
  fs.readFileSync(path.join(root, "agent-regressions/scenarios.json"), "utf8"),
);
const copy = () => structuredClone(suite);

test("checked-in suite covers the five requested boundaries with resolvable references", () => {
  assert.deepEqual(
    validateSuite(suite).map(({ id }) => id),
    [
      "data-api-schema",
      "fetch-readme",
      "oauth-runtime",
      "internal-release",
      "rust-generated-model",
    ],
  );
});

test("malformed input, duplicate ids, and missing rubric fail closed", () => {
  for (const malformed of [
    null,
    {},
    { version: 2, scenarios: [] },
    { version: 1, scenarios: [] },
  ])
    assert.throws(() => validateSuite(malformed), /Expected/);
  const duplicate = copy();
  duplicate.scenarios[1].id = duplicate.scenarios[0].id;
  assert.throws(() => validateSuite(duplicate), /duplicate/);
  for (const field of ["prompt", "inputs", "references", "rubric"]) {
    const missing = copy();
    delete missing.scenarios[0][field];
    assert.throws(() => validateSuite(missing));
  }
  const empty = copy();
  empty.scenarios[0].rubric.required = [" "];
  assert.throws(() => validateSuite(empty), /rubric/);
});

test("stale, unsafe, directory and noncanonical references are rejected", () => {
  for (const reference of [
    "missing-file.md",
    "../AGENTS.md",
    "/etc/passwd",
    "..\\AGENTS.md",
    "docs",
  ]) {
    const changed = copy();
    changed.scenarios[0].references.push(reference);
    assert.throws(() => validateSuite(changed));
  }
  const missing = copy();
  missing.scenarios[0].references = missing.scenarios[0].references.filter(
    (file) => file !== "workspace-policy.json",
  );
  assert.throws(() => validateSuite(missing), /canonical/);
});

test("references cannot escape through a symlink", (t) => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "agent-regression-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  fs.symlinkSync(
    path.join(root, "AGENTS.md"),
    path.join(temporary, "outside.md"),
  );
  const changed = copy();
  changed.scenarios[0].inputs = ["outside.md"];
  assert.throws(() => validateSuite(changed, temporary), /repository file/);
});

test("prompt output withholds grading rubrics; invalid CLI requests fail", () => {
  const output = run(["--show", "fetch-readme"], suite);
  assert.match(output, /read-only planning/);
  assert.match(output, /packages\/api\/client\/fetch\/README.md/);
  for (const criterion of Object.values(suite.scenarios[1].rubric).flat())
    assert.ok(!output.includes(criterion));
  assert.equal(run(["--list"], suite).split("\n").length, 5);
  assert.match(run([], suite), /no model evaluation/);
  for (const args of [
    ["--show", "unknown"],
    ["--show"],
    ["--list", "extra"],
    ["--typo"],
  ])
    assert.throws(() => run(args, suite));
});

test("canonical repo verification validates fixtures and validator without running models", () => {
  const plan = verificationPlan("repo", { workspaces: [] });
  assert.ok(plan.some(({ args }) => args[0] === "check:agent-regressions"));
  assert.ok(plan.some(({ args }) => args[0] === "test:agent-regressions"));
});
