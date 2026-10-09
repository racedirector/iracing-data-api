import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  analyzeImpact,
  changedPaths,
  loadWorkspaces,
  parseArgs,
  releaseOrder,
  root,
} from "./workspace-impact.mjs";

const workspaces = loadWorkspaces(root);
const report = (...files) => analyzeImpact(files, workspaces);
test("API contract edits affect both specs, SDKs, consumers and release ordering", () => {
  const impact = report("packages/api/schema/src/car.ts");
  assert.equal(impact.generatedClients.length, 3);
  assert.ok(
    !impact.generatedClients.includes("@iracing-data/oauth-client-fetch"),
  );
  assert.deepEqual(impact.derivedArtifacts, [
    "openapi/iracing.json",
    "openapi/iracing.yaml",
  ]);
  assert.ok(
    impact.internalDependents.includes("@iracing-data/api-schema-to-openapi"),
  );
  assert.ok(impact.generationCommands.includes("pnpm codegen"));
  assert.ok(
    impact.releaseOrder.indexOf("@iracing-data/api-schema") <
      impact.releaseOrder.indexOf("@iracing-data/api-client-fetch"),
  );
});
test("OAuth changes regenerate the OAuth client and follow manifest dependents", () => {
  const impact = report("packages/oauth/schema/src/token.ts");
  assert.deepEqual(impact.generatedClients, [
    "@iracing-data/oauth-client-fetch",
  ]);
  assert.ok(impact.authoredPackages.includes("@iracing-data/oauth-client"));
  assert.ok(
    impact.generationCommands.includes("pnpm codegen:client:oauth:fetch"),
  );
  assert.ok(impact.verificationCommands.includes("pnpm verify:examples"));
  assert.ok(
    impact.releaseOrder.indexOf("@iracing-data/oauth-schema") <
      impact.releaseOrder.indexOf("@iracing-data/oauth-client"),
  );
  assert.ok(
    impact.releaseOrder.indexOf("@iracing-data/oauth-client-fetch") <
      impact.releaseOrder.indexOf("@iracing-data/oauth-client"),
  );
  assert.deepEqual(impact.derivedArtifacts, [
    "openapi/oauth.json",
    "openapi/oauth.yaml",
  ]);
});
test("runtime, example, documentation and global tooling scopes remain distinct", () => {
  assert.deepEqual(report("README.md").managedReleaseCandidates, []);
  assert.deepEqual(
    report("examples/oauth-example/src/index.ts").managedReleaseCandidates,
    [],
  );
  assert.deepEqual(
    report("packages/oauth/client/src/index.ts").derivedArtifacts,
    [],
  );
  const global = report("pnpm-lock.yaml");
  assert.equal(global.managedReleaseCandidates.length, 7);
  assert.ok(global.verificationCommands.includes("pnpm verify"));
});
test("generator inputs, presentation and checked-in generated edits surface verification", () => {
  assert.equal(report("openapitools.json").generatedClients.length, 4);
  assert.equal(
    report("scripts/client-presentation/fetch.json").generatedClients.length,
    3,
  );
  assert.deepEqual(
    report("scripts/oauth-client-presentation/fetch.json").generatedClients,
    ["@iracing-data/oauth-client-fetch"],
  );
  assert.deepEqual(
    report("scripts/openapi-generator-oauth-fetch.sh").generatedClients,
    ["@iracing-data/oauth-client-fetch"],
  );
  assert.ok(
    report(
      "packages/api/client/fetch/runtime.ts",
    ).verificationCommands.includes("pnpm verify:generated"),
  );
  assert.ok(
    report(
      "packages/oauth/client/generated/src/runtime.ts",
    ).verificationCommands.includes("pnpm verify:generated"),
  );
  assert.ok(
    report("Cargo.lock").verificationCommands.includes("pnpm verify:rust"),
  );
});
test("reports are stable and do not mutate versions or select SemVer", () => {
  const files = ["packages/oauth/schema/package.json", "README.md"];
  assert.deepEqual(
    analyzeImpact(files, workspaces),
    analyzeImpact([...files].reverse().concat(files), workspaces),
  );
  assert.equal(report(...files).readiness.status, "requires-maintainer-review");
  assert.ok(
    report(...files).managedReleaseCandidates.every((entry) => entry.version),
  );
});
test("release order rejects dependency cycles", () => {
  assert.throws(
    () =>
      releaseOrder([
        { name: "a", dependencies: ["b"] },
        { name: "b", dependencies: ["a"] },
      ]),
    /cycle/,
  );
});
test("CLI rejects missing, malformed and unknown options", () => {
  assert.throws(() => parseArgs([]), /Usage/);
  assert.throws(() => parseArgs(["--base", "--json"]), /Usage/);
  assert.throws(() => parseArgs(["--base", "main", "--typo"]), /Usage/);
  assert.deepEqual(parseArgs(["--base", "main", "--json"]), {
    base: "main",
    json: true,
  });
});
test("git comparison includes deleted, renamed, staged, unstaged and untracked files", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "impact-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, { cwd: directory, stdio: "pipe" });
  git("init");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  for (const name of ["old", "deleted", "unstaged"])
    fs.writeFileSync(path.join(directory, name), "old");
  git("add", ".");
  git("commit", "-m", "base");
  git("branch", "base");
  git("mv", "old", "renamed");
  git("rm", "deleted");
  git("commit", "-m", "changes");
  fs.writeFileSync(path.join(directory, "unstaged"), "new");
  fs.writeFileSync(path.join(directory, "staged"), "new");
  git("add", "staged");
  fs.writeFileSync(path.join(directory, "untracked\nfile"), "new");
  assert.deepEqual(changedPaths(directory, "base"), [
    "deleted",
    "old",
    "renamed",
    "staged",
    "unstaged",
    "untracked\nfile",
  ]);
  assert.throws(() => changedPaths(directory, "missing-ref"));
});
