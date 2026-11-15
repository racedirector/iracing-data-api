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
const root = path.resolve(directory, "../../..");
const wrapper = fs.readFileSync(
  path.join(root, ".agents/skills/cli-command/SKILL.md"),
  "utf8",
);
const packageSkillPath =
  "apps/iracing-data-cli/.agents/skills/api-command/SKILL.md";
const packageSkill = fs.readFileSync(path.join(root, packageSkillPath), "utf8");
const livePath =
  "apps/iracing-data-cli/.agents/skills/api-command/references/live-contract-validation.md";
const live = fs.readFileSync(path.join(root, livePath), "utf8");

const obsolete =
  /validateSnapshot|scripts\/upstream-contract\.mjs|\.upstream-contract|--snapshot|contentHash|normalizerVersion|upstream:contract|test:upstream/;

test("Data API audit guidance uses current generated-client retrieval", () => {
  for (const text of [skill, workflow, report, tooling]) {
    assert.doesNotMatch(text, obsolete);
  }
  assert.match(skill, /current authoritative/i);
  assert.match(skill, /generated Data API client/i);
  assert.match(skill, /runtime discovery/);
  assert.match(workflow, /apps\/iracing-data-cli\/dist\/index\.js docs/);
  assert.match(workflow, /scripts\/audit-data-docs\.cjs -/);
  assert.match(
    tooling,
    /does \*\*not\*\* maintain a generic upstream evidence runtime/,
  );
});

test("guidance preserves compatibility maintenance and regeneration", () => {
  assert.match(skill, /compatibility maintenance/i);
  assert.match(skill, /#repair-and-regenerate/);
  assert.match(workflow, /## Repair and regenerate/);
  assert.match(workflow, /same current response/i);
  assert.match(workflow, /pnpm codegen:client:api/);
});

test("guidance preserves application ownership of opaque returned links", () => {
  for (const text of [skill, workflow, tooling]) {
    assert.match(text, /opaque/i);
    assert.match(text, /returned/i);
  }
  assert.match(tooling, /Applications may own safe resolution/);
  assert.match(tooling, /valid application behavior/);
});

test("report contract does not claim persisted evidence is current authority", () => {
  assert.doesNotMatch(report, /snapshot|provenance|content hash|normalizer/i);
  assert.match(report, /retrieval time/i);
  assert.match(report, /JSON pointer/i);
  assert.match(report, /fixture pass/i);
});

test("repository command guidance routes to the single package-local implementation skill", () => {
  assert.match(
    wrapper,
    /apps\/iracing-data-cli\/\.agents\/skills\/api-command\/SKILL\.md/,
  );
  assert.match(
    skill,
    /apps\/iracing-data-cli\/\.agents\/skills\/api-command\/SKILL\.md/,
  );
  assert.doesNotMatch(wrapper, /## Service implementation|### Command/);
  assert.match(packageSkill, /^name: api-command$/m);
  assert.match(packageSkill, /injected|Inject/);
  assert.match(packageSkill, /safeParse/);
  assert.match(packageSkill, /Never hand-edit generated artifacts/);
});

test("the live workflow orders docs diff, input repair, raw response validation, and final regeneration", () => {
  const markers = [
    "## 1. Preflight and build",
    "## 2. Authentication",
    "## 3. Fetch current docs once",
    "## 4. Diff and classify before probing",
    "## Repair and regenerate",
    "## 5. Validate our live inputs and outputs",
    "## 6. Repair outputs and rerun",
    "## 7. Close the reconciliation",
  ];
  let previous = -1;
  for (const marker of markers) {
    const index = workflow.indexOf(marker);
    assert.ok(index > previous, `Missing or unordered gate: ${marker}`);
    previous = index;
  }
  assert.match(workflow, /codegen:client:api:fetch/);
  assert.match(workflow, /raw[\s\S]*before client[\s\S]*normalization/);
  assert.match(workflow, /same current response/);
});

test("authentication failures require bounded, error-specific operator recovery", () => {
  assert.match(workflow, /auth login --method=password-limited/);
  for (const category of [
    "Existing credential destination",
    "HTTP 401",
    "HTTP 403",
    "HTTP 429",
  ]) {
    assert.ok(workflow.includes(category), category);
  }
  assert.match(workflow, /authorization to replace[\s\S]*--force/);
  assert.match(workflow, /No login loops/);
  assert.match(workflow, /do not require `whoami` or `iracing.profile`/);
  assert.match(
    workflow,
    /environment access token[\s\S]*override newly saved credentials/,
  );
});

test("live cases test our input/output contracts, never generated implementations", () => {
  for (const text of [skill, packageSkill, live]) {
    assert.match(text, /canonical/i);
    assert.match(
      text,
      /generated[\s\S]*(?:not the (?:test )?subject|not the subject|transport)/i,
    );
  }
  assert.match(
    live,
    /Do not assert generated class[\s\S]*decoder[\s\S]*snapshots/,
  );
  assert.match(live, /one representative valid request per endpoint/);
  assert.match(live, /not every flag permutation/);
  assert.match(
    live,
    /envelope passing validation says nothing about the linked/i,
  );
  assert.match(live, /cannot[\s\S]*establish[\s\S]*filter was honored/);
});

test("missing runtime tooling and blocked cases cannot produce a full-live compatible verdict", () => {
  assert.match(live, /no executable all-endpoint live contract suite/i);
  assert.match(live, /response-only[\s\S]*not every runtime endpoint/);
  assert.match(live, /PASS \/ CONTRACT_MISMATCH \/ BLOCKED \/ NOT_RUN/);
  assert.match(live, /not valid live cases/i);
  assert.match(skill, /cannot receive a full live[\s\S]*Compatible/);
  assert.match(report, /full live gate is absent or[\s\S]*blocked/);
  assert.match(live, /Normal `pnpm verify` must remain service-free/);
  assert.match(skill, /test:live --run/);
  assert.match(skill, /one endpoint, not the full/);
});

test("reconciliation decisions have dated living memory and require fresh revalidation", () => {
  const log = fs.readFileSync(
    path.join(root, "docs/DATA-API-RECONCILIATION.md"),
    "utf8",
  );
  for (const text of [skill, workflow, report]) {
    assert.match(text, /DATA-API-RECONCILIATION\.md/);
    assert.match(text, /retain \/ revise \/ revert/);
  }
  assert.match(skill, /whenever contract changes are made/);
  assert.match(skill, /git commit and dirty-tree/);
  assert.match(skill, /implementation commits/);
  assert.match(skill, /historical context, not current upstream/);
  assert.match(log, /DATA-001/);
  assert.match(log, /Implementation commit: \*\*pending/);
  assert.match(log, /not current upstream authority/);
});

test("case changes retain command accountability without forced CLI churn", () => {
  for (const text of [skill, workflow, packageSkill, live, report]) {
    assert.match(text, /(?:add|Add)[\s\S]*modify[\s\S]*retain[\s\S]*retire/);
    assert.match(text, /schema-only/i);
  }
  assert.match(live, /Never[\s\S]*remove a failing case/);
  assert.match(live, /Missing documentation alone does not authorize retiring/);
});

test("changed guidance links resolve inside the checkout", () => {
  const paths = [
    ".agents/skills/cli-command/SKILL.md",
    ".agents/skills/iracing-data-api-compatibility-audit/SKILL.md",
    ".agents/skills/iracing-data-api-compatibility-audit/references/live-workflow.md",
    ".agents/skills/iracing-data-api-compatibility-audit/references/report-contract.md",
    "docs/UPSTREAM-CONTRACT.md",
    "docs/DATA-API-RECONCILIATION.md",
    packageSkillPath,
    livePath,
  ];
  for (const relative of paths) {
    const source = path.join(root, relative);
    const text = fs.readFileSync(source, "utf8");
    for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^https?:/.test(target) || target.startsWith("#")) continue;
      const destination = path.resolve(
        path.dirname(source),
        target.split("#")[0],
      );
      assert.ok(
        destination.startsWith(`${root}${path.sep}`),
        `${relative}: ${target}`,
      );
      assert.ok(fs.statSync(destination).isFile(), `${relative}: ${target}`);
    }
  }
});
