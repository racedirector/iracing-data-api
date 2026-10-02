import assert from "node:assert/strict";
import test from "node:test";
import { verificationPlan, runPlan, subsystems } from "./verify.mjs";

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
  assert.deepEqual(verificationPlan("generated", policy).at(-1).args, [
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
