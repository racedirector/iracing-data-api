import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const skill = fs.readFileSync(path.join(directory, "SKILL.md"), "utf8");
const workflow = fs.readFileSync(
  path.join(directory, "references/live-workflow.md"),
  "utf8",
);
const report = fs.readFileSync(
  path.join(directory, "references/report-contract.md"),
  "utf8",
);
const tooling = fs.readFileSync(
  path.join(directory, "../../../docs/UPSTREAM-CONTRACT.md"),
  "utf8",
);

const obsolete =
  /validateSnapshot|scripts\/upstream-contract\.mjs|\.upstream-contract|--snapshot|contentHash|normalizerVersion|upstream:contract|test:upstream/;

test("Data API audit guidance uses current generated-client retrieval", () => {
  for (const text of [skill, workflow, report, tooling]) {
    assert.doesNotMatch(text, obsolete);
  }
  assert.match(skill, /current authoritative/i);
  assert.match(skill, /generated Data API client/i);
  assert.match(workflow, /apps\/iracing-data-cli\/dist\/index\.js docs/);
  assert.match(workflow, /scripts\/audit-data-docs\.cjs -/);
  assert.match(tooling, /does \*\*not\*\* maintain a generic upstream evidence runtime/);
});

test("guidance preserves application ownership of opaque returned links", () => {
  for (const text of [skill, workflow, tooling]) {
    assert.match(text, /opaque/i);
    assert.match(text, /returned/i);
  }
  assert.match(tooling, /application-owned resolution/);
});

test("report contract does not claim persisted evidence is current authority", () => {
  assert.doesNotMatch(report, /snapshot|provenance|content hash|normalizer/i);
  assert.match(report, /retrieval time/i);
  assert.match(report, /JSON pointer/i);
  assert.match(report, /fixture pass/i);
});
