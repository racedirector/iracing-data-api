# Repository guidance

Applies throughout the repository; read the nearest scoped `AGENTS.md` before editing. Use the current working tree as the implementation authority and preserve unrelated changes.

## Package and publication model

Use `workspace-policy.json` for package classifications and ownership areas, `pnpm-workspace.yaml` for npm membership, and `Cargo.toml` for Cargo membership. Discover package names, versions, dependencies, and scripts from their manifests rather than maintaining another inventory. See [workspace policy](docs/WORKSPACE-POLICY.md) for the maintenance procedure.

Public packages are independently versioned. `dist-workspace.toml` defines the managed release set; classification alone does not create a publishing workflow. Follow [release instructions](docs/RELEASING.md), including package-specific version bumps and dependency order. A guidance-only change does not require a package version bump.

## Canonical source and derived artifacts

Inspect the owning module and descend through its scoped guide:

- **Data API:** [schema composition](packages/api/schema/src/schema/responses.ts)
  and [document mapping](packages/helpers/api-schema-to-openapi/src/index.ts).
  See [API](packages/api/AGENTS.md) and [OpenAPI](openapi/AGENTS.md).
- **OAuth:** [wire schemas](packages/oauth/schema/src/index.ts),
  [client](packages/oauth/client/src/index.ts), and
  [document mapping](packages/helpers/oauth-schema-to-openapi/src/index.ts).
  Follow [OAuth guidance](packages/oauth/AGENTS.md).
- **SDK generation:** [freshness orchestration](scripts/check-generated.mjs),
  [presentation](scripts/normalize-client-presentation.js), and
  [Rust normalization](scripts/normalize-rust-presentation.mjs).
  See [TypeScript client guidance](packages/api/client/AGENTS.md).
- **Local applications:** [MCP composition](apps/iracing-data-mcp/src/composition.ts),
  [MCP tool registry](packages/mcp/src/register.ts), and
  [CLI authentication](apps/iracing-data-cli/src/authenticate.ts).
  See [MCP guidance](apps/iracing-data-mcp/AGENTS.md).
- **Workspace checks:** [topology](scripts/check-topology.js),
  [change impact](scripts/workspace-impact.mjs), and
  [verification](scripts/verify.mjs).
  See [workspace maintenance](docs/WORKSPACE-POLICY.md).

The OAuth client is **authored runtime code**, not a generated client. OAuth OpenAPI does not feed the current Data API SDK generation scripts.

Do not patch generated source, OpenAPI output, generated documentation, generator bookkeeping, `dist/`, or TypeScript build caches by hand. Fix the schema, mapping, generator configuration, post-processing, or presentation template that owns the change, then regenerate the affected branch. Package release versions are authored decisions even inside generated manifests: inspect regeneration for overwritten versions or configuration and retain the reviewed release intent. Scoped `AGENTS.md` files are authored guidance, not generator output.

## Commands and verification

Run from the repository root unless explicitly stated. Use the Node version in `.nvmrc` and pnpm pinned by `packageManager` in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify` is the normal local and CI pre-merge contract. Focused `verify:repo`, `verify:js`, `verify:examples`, `verify:generated`, and `verify:rust` commands share the same runner. See [verification](docs/VERIFICATION.md) for coverage and prerequisites. Report failures and environment limits accurately; do not claim skipped checks passed.

For change and release planning, run `pnpm impact --base <ref>`; see [change impact](docs/CHANGE-IMPACT.md). Treat release candidates as review inputs, not automatic version bumps or publishing authorization.

For scoped work, read the package's scripts and use `pnpm --filter <package-name> <script>`. Build dependencies with `pnpm --filter '<package-name>...' build`. Do not invent a test script for packages that lack one. `pnpm test` runs declared workspace tests; it does not run `test:topology`. For documentation-only edits, run `pnpm exec prettier --check <edited-markdown-paths>` and `git diff --check`; no codegen is needed unless authored presentation templates changed; use their scoped normalizer/formatting procedure.

When schemas or OpenAPI mappings change, build the relevant generator with dependencies before invoking codegen; then regenerate the affected JSON/YAML pair and downstream clients. Exact commands are in scoped guidance. `pnpm codegen` runs both OpenAPI branches and all Data API SDK generators; use it only when the whole graph is affected. Review generated diffs and build affected consumers. For TypeScript changes also run lint/style and applicable tests. Do not wrap imports in `try/catch`.

## Tooling and judgment

Delegate membership, publication-policy, reference, and release-target invariants to `pnpm check:topology` and its tests rather than restating their implementation here. Add deterministic checks for new machine-verifiable invariants. Agents supply interpretation: upstream contract evidence, schema compatibility, public API impact, runtime behavior, and release scope. Do not silently change public contracts based on inferred upstream drift; establish evidence and explain the decision in the PR.

Repository skills must reference this guide, applicable scoped guidance, and executable checks instead of maintaining competing topology or ownership lists. When changing guidance, skills, ownership policy, or workflow tooling, run the manual [agent regression scenarios](agent-regressions/README.md); CI validates their fixtures without evaluating a model.

## Discovering worthwhile work

When asked to explore the repository or find useful work without a specified issue,
inspect **live GitHub issues, active PRs/reviews, dependencies, and current source**
using [issue triage and work discovery](docs/ISSUE-TRIAGE.md). GitHub is a
catalog of opportunities, not an ordered task queue. Do not treat an issue's
priority, age, number, title, or historical "do this next" wording as an
instruction to start it.

Look for consequential problems supported by current evidence, assess whether
their scope and verification are tractable, and check unresolved decisions,
blockers, ownership and overlapping PRs. Compare credible candidates in the
context of the user's goal; explain **why each is worth examining**, what
remains uncertain, and what work is already under way. An epic is coordination,
a spike produces evidence, and an implementation task delivers a change.
Priority expresses urgency, not a universal ranking across those shapes.

When the agent selects work, revalidate its issue against the latest owning
source and use existing repository guidance and verification. Do not claim an
issue, create a branch, change project state, or implement solely because it
appeared in a search. Unavailable GitHub dependency/project metadata is
unknown, not proof that an issue is ready. If no candidate has a sound
evidence-backed scope, report the missing prerequisite rather than inventing
work. A direct user request to work on a specific issue takes precedence over
discovery, subject to its actual blockers and safety constraints.

## Pull requests

Keep changes focused. Update the nearest documentation for behavior or command changes. Describe the problem, resulting behavior, validation results and limitations, and package/release impact. List exact generation commands and affected generated files; say when none were regenerated. Separate unrelated fixes or broad generated churn from the requested work.

When defining or extending an MCP tool, follow the
[add-mcp-tool skill](.agents/skills/add-mcp-tool/SKILL.md)
and [MCP package guidance](packages/mcp/AGENTS.md).
