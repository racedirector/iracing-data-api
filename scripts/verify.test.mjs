import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { root, verificationPlan, runPlan, subsystems } from "./verify.mjs";

const policy = {
  workspaces: [
    { name: "schema", ecosystem: "npm", kind: "public-release-target" },
    { name: "tool", ecosystem: "npm", kind: "internal-tool" },
    { name: "demo", ecosystem: "npm", kind: "example" },
    { name: "sdk", ecosystem: "npm", kind: "generated-public-client" },
    { name: "rust-sdk", ecosystem: "cargo", kind: "generated-public-client" },
    { name: "root", ecosystem: "npm", kind: "repository-root" },
  ],
};

test("build selection follows policy and includes dependency closure", () => {
  assert.deepEqual(verificationPlan("js", policy)[0].args, [
    "--filter",
    "schema...",
    "--filter",
    "tool...",
    "--fail-if-no-match",
    "build",
  ]);
  assert.deepEqual(verificationPlan("examples", policy)[0].args, [
    "--filter",
    "demo...",
    "--fail-if-no-match",
    "build",
  ]);
  assert.deepEqual(verificationPlan("generated", policy).at(-2).args, [
    "--filter",
    "sdk...",
    "--fail-if-no-match",
    "build",
  ]);
});

test("unknown or empty build selection fails closed", () => {
  assert.throws(() => verificationPlan("typo", policy), /Unknown/);
  assert.throws(
    () => verificationPlan("examples", { workspaces: [] }),
    /No examples/,
  );
});

test("normal verification covers every subsystem and locked Rust checks", () => {
  assert.deepEqual(subsystems, ["repo", "js", "examples", "generated", "rust"]);
  const rust = verificationPlan("rust", policy);
  assert.equal(rust.length, 4);
  assert.ok(rust.slice(1).every((step) => step.args.includes("--locked")));
  assert.equal(rust[2].args[0], "clippy");
});

test("a failing command stops the plan and preserves its exit status", () => {
  let calls = 0;
  const status = runPlan(
    [
      { label: "first", command: "fake", args: [] },
      { label: "never", command: "fake", args: [] },
    ],
    () => {
      calls++;
      return { status: 7 };
    },
  );
  assert.equal(status, 7);
  assert.equal(calls, 1);
});

test("missing executables fail rather than silently skipping", () => {
  assert.equal(
    runPlan([{ label: "missing", command: "fake", args: [] }], () => ({
      error: new Error("ENOENT"),
      status: null,
    })),
    1,
  );
});

test("generated wire tests run after the generated client build", () => {
  const plan = verificationPlan("generated", policy);
  assert.equal(plan.at(-2).args.at(-1), "build");
  assert.deepEqual(plan.at(-1).args, ["test:data-contract"]);
});

test("schema and generated-wire selectors are disjoint and wire runs after SDK builds", () => {
  const manifest = JSON.parse(fs.readFileSync(`${root}/package.json`, "utf8"));
  const selectedFiles = (script) => {
    const pattern = manifest.scripts[script].split(" ").at(-1);
    return fs.globSync(pattern, { cwd: root }).sort();
  };
  const schemas = selectedFiles("test:schema-compatibility");
  const wires = selectedFiles("test:data-contract");
  assert.ok(schemas.length > 0);
  assert.deepEqual(wires, ["tests/data-contract/data-docs-wire.test.cjs"]);
  assert.ok(wires.every((file) => !schemas.includes(file)));
  const generated = verificationPlan("generated", policy);
  const wireIndex = generated.findIndex((step) =>
    step.args.includes("test:data-contract"),
  );
  assert.ok(
    wireIndex > generated.findIndex((step) => step.args.includes("sdk...")),
  );
});
