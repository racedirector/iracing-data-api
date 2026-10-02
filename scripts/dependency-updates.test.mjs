import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { parse } from "yaml";

const read = (file) =>
  fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const config = parse(read(".github/dependabot.yml"));
test("npm updates use one root workspace scope with no overlapping scans", () => {
  const npm = config.updates.filter(
    (entry) => entry["package-ecosystem"] === "npm",
  );
  assert.equal(npm.length, 1);
  assert.equal(npm[0].directory, "/");
  assert.equal(npm[0].directories, undefined);
  assert.equal(npm[0].ignore, undefined);
});
test("routine groups exclude major updates and sensitive runtime dependencies", () => {
  const npm = config.updates.find(
    (entry) => entry["package-ecosystem"] === "npm",
  );
  for (const group of Object.values(npm.groups))
    assert.ok(!group["update-types"].includes("major"));
  assert.deepEqual(npm.groups["runtime-patches"]["update-types"], ["patch"]);
  for (const dependency of [
    "oauth4webapi",
    "better-call",
    "zod*",
    "axios",
    "@openapitools/*",
  ]) {
    assert.ok(
      npm.groups["runtime-patches"]["exclude-patterns"].includes(dependency),
    );
  }
  assert.ok(!npm.groups["lint-and-format"].patterns.includes("*"));
});
test("dependency impact uses exact PR base, full history and a temp artifact", () => {
  const ci = parse(read(".github/workflows/ci.yml"));
  assert.equal(ci.permissions.contents, "read");
  const steps = ci.jobs.verify.steps;
  assert.equal(
    steps.find((step) => step.name === "Checkout").with["fetch-depth"],
    0,
  );
  const report = steps.find(
    (step) => step.name === "Report dependency change impact",
  );
  assert.ok(report.if.includes("github.event.pull_request.user.login"));
  assert.equal(
    report.env.IMPACT_BASE,
    "${{ github.event.pull_request.base.sha }}",
  );
  assert.ok(report.run.includes('--base "$IMPACT_BASE" --json'));
  assert.ok(report.run.includes("$RUNNER_TEMP/dependency-impact.json"));
  assert.equal(
    steps.find((step) => step.name === "Upload dependency impact").with.path,
    "${{ runner.temp }}/dependency-impact.json",
  );
  assert.equal(
    steps.find((step) => step.name === "Verify repository").run,
    "pnpm verify",
  );
});
