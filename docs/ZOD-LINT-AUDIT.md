# Zod lint audit

Audited on October 15, 2026 against `chore/eslint-config-cleanup` at `c5787e6`. Implementation
branch: `chore/zod-lint-audit`. The audit was rebased onto the requested ESLint cleanup branch and uses a separate
worktree, preserving the original checkout.

## Repository evidence

The root uses ESLint 10.12.0 with a single flat `eslint.config.mjs`, TypeScript
5.9.3, Node 24, and pnpm 12.11.2. Existing plugins cover TypeScript types, imports, architecture, control flow,
formatting and JSDoc; none understands Zod schema semantics. TypeScript
projects extend `tsconfig/node.json` and `tsconfig/base.json`, with strict checking
and package build references. Authored runtime lint uses TypeScript Project Service and strict type-aware
presets; schema tests retain the baseline checks.

Zod is broadly used, with every declaring workspace requiring `^4.3.6` and the
lockfile resolving one version, 4.6.5:

- `packages/api/schema` owns canonical Data API primitives, query adapters and
  response schemas; tests characterize coercion, metadata and compatibility.
- `packages/oauth/schema` owns wire contracts, scopes, JWT claims and metadata;
  `packages/oauth/client/src/schema` owns runtime configuration and storage.
- `packages/mcp/tools` owns tool inputs, output projections, continuation and
  sanitized error schemas. Its narrower positive IDs are distinct from permissive
  upstream domain values.
- MCP application configuration and JWT policy have local schemas. The CLI mostly
  consumes shared schemas; it has no separate Zod dependency or schema inventory.
- OAuth examples contain local schemas, including the password-limited example's
  asset/track validation.
- Both OpenAPI helpers use `zod-openapi` 6.0.2. Zod metadata, codecs and explicit
  input/output projection affect JSON Schema/OpenAPI and generated SDKs. Generated
  clients do not become authored lint targets.

`.meta()` carries IDs, descriptions, parameter/header configuration and projection
options. It is not interchangeable with JSDoc. The inner `note` union in
`responses.ts` intentionally receives `unionOneOf` metadata before `.optional()`.
Transforms normalize nullable output; codecs distinguish input/output; numeric
preprocessors guard wire inputs and retain named enum projections. Existing
`.refine()`/`.superRefine()` checks include uniqueness, mutually exclusive fields,
OAuth configuration and error-policy relationships. No blanket native primitive
replacement preserves all those checks. Both throwing `.parse()` and result-based
`.safeParse()` have deliberate callers.

## Tool selection

Only **`eslint-plugin-zod@5.0.1`** is added, as an exact root development dependency.
It supports Zod v4, ESLint 9/10, flat config and TypeScript ASTs without requiring a
second type-checking configuration. Its import tracker recognizes named, namespace
and aliased imports rather than matching arbitrary objects named `z`. The selected
rules have executable policy tests in `scripts/eslint-zod-policy.test.mjs`, included
in the existing `test:verification` command.

Primary evidence inspected:

| Candidate                                                                  | Evidence and decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [eslint-plugin-zod](https://github.com/marcalexiei/eslint-zod)             | Current upstream, active releases through 5.2.0 on October 15; 5.0.1 released October 12. Registry peers are Zod `^4` and ESLint `^9 \|\| ^10`. Upstream had 81 stars, 14 forks and no open issues/PRs at inspection; npm reported 132,740 downloads for October 6–12. Rule documentation and published implementations were inspected. These are adoption/activity signals, not correctness guarantees. Pin 5.0.1: it provides all selected rules without adding release-age exceptions for today's release.                                        |
| [eslint-plugin-zod-x](https://www.npmjs.com/package/eslint-plugin-zod-x)   | Version 2.1.0, January 14, 2026; its published README explicitly deprecates it in favor of `eslint-plugin-zod`. Zod v4/ESLint 9 peers, but no reason to install the superseded name or duplicate its rules. The older SimonVadier repository is not the current published maintainer.                                                                                                                                                                                                                                                                |
| [eslint-plugin-zod-v4](https://www.npmjs.com/package/eslint-plugin-zod-v4) | Version 0.4.1, September 26, 2026; ESLint 9/10 and flat-config support. Published helper source identifies Zod by the literal identifier `z` and schema-name heuristics; aliases can escape checks and unrelated objects can match. Its `prefer-safeParse` fixer changes the returned value's shape without updating callers. Published format replacements also need special handling for ISO namespaces. The linked GitHub repository returned 404 during inspection, limiting issue/activity verification. Reject in favor of import-aware rules. |
| Existing ESLint / typescript-eslint                                        | Keep existing rules. `no-explicit-any` does not prevent `z.any()`; the cleanup branch already enables type-aware `no-deprecated` in authored runtime. Retain it and avoid duplicate Zod diagnostics there. Core `no-restricted-imports` reliably blocks explicit v3 imports. No additional plugin is needed for that.                                                                                                                                                                                                                                |
| Zod Mini/Core plugins                                                      | Available from the selected upstream, but this repository uses the full Zod API. Do not add unused rule packages.                                                                                                                                                                                                                                                                                                                                                                                                                                    |

The current [Zod migration guide](https://zod.dev/v4/changelog) establishes the
modern number/string/object APIs, native enum replacement, and v4 defaulting
semantics. Published plugin implementations and local runtime/contract checks
were used alongside that guidance; no whole plugin preset is enabled.

## Enabled rules

All enabled rules below are **errors**. There are no new warning-level rules.
Nine rules that duplicate the existing type-aware `@typescript-eslint/no-deprecated`
are enabled only outside authored runtime: `no-native-enum`,
`no-number-schema-with-finite`, `no-number-schema-with-safe`,
`no-number-schema-with-step`, `no-number-schema-with-is-finite`,
`no-number-schema-with-is-int`, `no-schema-with-is-nullable`,
`no-schema-with-is-optional`, and `prefer-top-level-string-formats` (all prefixed
`zod/`). They are explicitly off in the authored runtime block; the stronger
semantic rule remains an error there. The other twelve Zod rules apply throughout
authored code. The block
covers authored JavaScript and TypeScript, including schema tests and examples;
existing generated/build exclusions remain unchanged. Generated TypeScript
continues to receive only its existing architecture checks.

| Rules (prefix `zod/`)                                                                                                                                                                      | Purpose                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `no-any-schema`, `no-empty-custom-schema`                                                                                                                                                  | Prevent validators that silently introduce `any` or unchecked custom values. Explicit `unknown` remains available for genuinely unspecified wire data. |
| `no-coerce-boolean`                                                                                                                                                                        | Prevent JavaScript truthiness from accepting the string `"false"` as true. Preserve the canonical exact true/false query preprocessor.                 |
| `no-conflicting-checks`                                                                                                                                                                    | Detect statically contradictory or inapplicable constraints.                                                                                           |
| `no-throw-in-refine`                                                                                                                                                                       | Keep validation failures in Zod's result/error model.                                                                                                  |
| `no-transform-in-record-key`                                                                                                                                                               | Prevent silent key mutation/collision and data loss.                                                                                                   |
| `require-brand-type-parameter`                                                                                                                                                             | Prevent branding that adds no meaningful inferred type distinction.                                                                                    |
| `no-native-enum`, `no-promise-schema`                                                                                                                                                      | Discourage legacy v3 construction patterns.                                                                                                            |
| `no-number-schema-with-finite`, `no-number-schema-with-int`, `no-number-schema-with-safe`, `no-number-schema-with-step`, `no-number-schema-with-is-finite`, `no-number-schema-with-is-int` | Use modern integer/multiple-of APIs and avoid redundant or deprecated number checks/introspection.                                                     |
| `no-schema-with-is-nullable`, `no-schema-with-is-optional`                                                                                                                                 | Avoid deprecated schema introspection.                                                                                                                 |
| `prefer-top-level-string-formats`                                                                                                                                                          | Use `z.url()` and `z.iso.*` rather than legacy chained format methods.                                                                                 |
| `prefer-loose-object`, `prefer-strict-object`                                                                                                                                              | Use explicit v4 object constructors while preserving unknown-key policy.                                                                               |
| `prefer-meta`                                                                                                                                                                              | Keep schema descriptions in the established metadata API. This does not invent descriptions or validate their meaning.                                 |

Core `no-restricted-imports` is also **error** for `zod/v3` and `zod/v3/*`, preventing
explicit old-version ESM imports from bypassing the v4 policy. This rule does not
claim to cover dynamic imports or CommonJS `require`.

## Findings and repairs

The initial selected-rule run reported 67 diagnostics across 14 schema-bearing files:

| Finding            | Initial count | Repair                                                                          |
| ------------------ | ------------: | ------------------------------------------------------------------------------- |
| `z.number().int()` |            66 | Replace with `z.int()`, retaining bounds, optionality, defaults and transforms. |
| `.loose()`         |             1 | Use `z.looseObject()` for the race-result materialization projection.           |

The cleanup base had already removed redundant `.safe()`/`.finite()` and chained
string formats; those are not attributed to this change.

No selected weak-schema, coercion, brand, contradictory-check or refinement-throw
violations existed. No coercion behavior, native refinements, canonical primitive
ownership or error messages were changed. No suppressions were added.

Both complete generated OpenAPI documents and their JSON/YAML pairs are compared
against the cleanup base through the repository freshness checks.
`pnpm verify:generated` regenerated both OpenAPI branches and all SDKs in isolation;
no checked-in generated files needed replacement because they were identical. Public package versions were not bumped: there is no intended public
runtime acceptance or wire-contract change; release intent remains a separate
review decision.

## Rules deliberately not enabled

| Candidate                                                                                                    | Classification and repository reason                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-unknown-schema`                                                                                          | Not appropriate: undocumented constants, extension data and upstream record fields intentionally use `unknown`, which requires consumers to narrow values.                                                                                                                |
| `no-optional-and-default-together`                                                                           | Not appropriate globally: one occurrence in OAuth PKCE configuration; removing `.optional()` can change the inferred output's optionality. Existing omission/default/projection behavior is contractual. No automatic cleanup.                                            |
| `prefer-meta-last`                                                                                           | Not appropriate: one finding is the intentional inner `note` union metadata. Moving it can change the generated OpenAPI projection.                                                                                                                                       |
| `require-error-message`                                                                                      | Not appropriate as a global requirement: seven refinements use Zod's generic message, and tool failures are mapped to a sanitized application contract. Adding prose changes observable errors without fixing validation. Assess user-facing diagnostic needs separately. |
| `no-duplicate-schema-methods`                                                                                | Not appropriate globally: repeated bounds or metadata calls can be intentional composition; blanket prohibition is stronger than semantic contradiction detection. Candidate scan found none.                                                                             |
| `no-dynamic-schema-value`, `no-function-scoped-schema`                                                       | Not appropriate: parameter-schema factories, runtime configuration and tool registration construct schemas from legitimate values. No blanket hoisting or static-only requirement.                                                                                        |
| `prefer-enum-over-literal-union`                                                                             | Not appropriate: individual enum members have documentation metadata, including numeric enums; changing union structure can change contracts.                                                                                                                             |
| `prefer-string-schema-with-trim`, `prefer-trim-before-string-length-checks`                                  | Not appropriate globally: wire strings and OAuth identifiers must retain exact values and explicit normalization order. The ordering-rule candidate scan found no current issue.                                                                                          |
| `prefer-nullish`, `no-unnecessary-readonly`                                                                  | Not appropriate as repository requirements: candidate scans found no problems; no correctness benefit established over current deliberate wrappers.                                                                                                                       |
| `prefer-tuple-over-array-length`                                                                             | Not appropriate globally: array validation and tuple inference/document output are different public contracts.                                                                                                                                                            |
| `array-style`, import style/source, schema variable naming, output-type style, `schema-error-property-style` | Not appropriate: existing mixed names/imports are supported; naming and error-expression preferences do not establish correctness.                                                                                                                                        |
| `prefer-string-length-over-min-max`, `prefer-map-set-size-over-min-max`, `prefer-validate`                   | Not appropriate for this change: no demonstrated defect; avoid additional cosmetic churn and APIs newer than the workspace's declared minimum without need.                                                                                                               |
| Blanket `parse` prohibition                                                                                  | Not appropriate: throwing startup/configuration boundaries and test assertions deliberately use `parse`; `safeParse` has a different return type.                                                                                                                         |
| Canonical-schema reuse, required meaningful metadata, replacing custom refinements, arbitrary coercion bans  | Not reliably enforceable by these rules. Schema identity, domain semantics and OpenAPI projection require semantic review and contract tests; do not use name/field heuristics.                                                                                           |

## Follow-up boundaries

Existing legacy customer-ID/general numeric coercion intentionally remains for
compatibility. MCP positive/bounded IDs and Data API permissive domain numbers
should not be unified solely because their names resemble each other. Metadata
completeness and mapping projection correctness remain the responsibility of
schema/helper tests and review. Static import tracking is not whole-program type
analysis: imported schemas, factory returns and some later chains can escape
checks. In particular, the selected number `.safe()` rule does not cover every
`z.int().safe()` chain; the cleanup base already removed its existing instances, and runtime
`@typescript-eslint/no-deprecated` catches them semantically.

## Validation

Validation used Node 24.21.0, pnpm 12.11.2 and the frozen cleanup dependency graph
plus the selected plugin. No live iRacing credentials or service calls were used.

| Command / check                                      | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                     | Passed; no release-age or build-permission policy changes.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pnpm build`                                         | Passed for every workspace, including affected schemas, apps and examples.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pnpm verify` repository phase                       | Passed topology, boundary, tooling/agent-fixture regressions, lint (zero errors/warnings), and whole-repository formatting. Includes 81 verification/policy tests, 27 of them Zod policy cases.                                                                                                                                                                                                                                                                                         |
| Affected package tests (command below)               | Passed: API schema 37, Data API OpenAPI 5, OAuth OpenAPI 1, OAuth client 63, MCP tools 11, MCP app 125, password-limited example 1.                                                                                                                                                                                                                                                                                                                                                     |
| `pnpm verify:examples`                               | Passed all example builds.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pnpm verify:generated`                              | Passed nine generation/normalization tests, isolated regeneration of both OpenAPI branches and all four SDKs, byte-for-byte freshness comparison, generated TypeScript builds and five wire-contract tests. No checked-in generated files changed.                                                                                                                                                                                                                                      |
| Complete document comparison                         | `assert.deepEqual` compared rebuilt Data API and OAuth document objects against both checked-in JSON/YAML formats at `chore/eslint-config-cleanup`; all four matched.                                                                                                                                                                                                                                                                                                                   |
| `pnpm impact --base chore/eslint-config-cleanup`     | Passed; global lint tooling affects workspace verification. Release candidates are review inputs only.                                                                                                                                                                                                                                                                                                                                                                                  |
| `git diff chore/eslint-config-cleanup --check`       | Passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Full `pnpm verify` / OAuth schema compatibility test | Fails on four inherited historical-export checks. An untouched detached worktree at `c5787e6` reproduced the same four failures with `pnpm --filter @iracing-data/oauth-schema test`. They reference removed car/track schemas and aliases, including `GetCarAssetsResponseSchema`, `GetCarResponseSchema`, and track equivalents; the type fixture has 32 missing-export diagnostics. Schema acceptance tests pass. These removals and historical fixtures are unchanged by this task. |

Affected package test invocation:

```bash
pnpm --filter @iracing-data/api-schema \
  --filter @iracing-data/api-schema-to-openapi \
  --filter @iracing-data/oauth-schema-to-openapi \
  --filter @iracing-data/oauth-client \
  --filter @iracing-data/mcp-tools \
  --filter @iracing-data/iracing-data-mcp \
  --filter iracing-password-limited-oauth test
```

Full verification stops in JavaScript tests at the inherited compatibility failure;
later phases are not claimed as passing through that invocation. Examples and
generated verification were run separately. Rust runtime tests and Docker recovery
are outside this authored TypeScript lint change and were not run.

## Manual agent regression record

The repository's required five read-only planning exercises were run in fresh
agent contexts against commit `130f748` on the cleanup-based audit branch. Normal
session tools/skills and scoped repository instructions were available; the
scenario rubric and this audit were withheld. Agents used the session's inherited
model (exact model/version not exposed by the collaboration API). The evaluator
read `agent-regressions/scenarios.json`; no rubric or fixture was changed.
The following abbreviated answer record identifies the session transcripts and
supports each required criterion. No forbidden action was proposed or executed.

| Scenario / session transcript                            | Required criteria | Answer evidence and result                                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-api-schema` / `/root/cleanup_regression_data`      | 3/3 pass          | Located response schema and endpoint mapping; required official evidence, optionality/nullability tests and compatibility review; proposed both Data API formats/all SDKs; used policy/manifests/impact and independent release decisions. **Pass.**                                   |
| `fetch-readme` / `/root/cleanup_regression_fetch`        | 3/3 pass          | Chose `scripts/client-presentation/fetch.md`, scoped normalizer/generated formatting, diff/freshness review and no automatic contract/version change. **Pass.**                                                                                                                        |
| `oauth-runtime` / `/root/cleanup_regression_oauth`       | 3/3 pass          | Inspected dependency lowercasing and authored bridge; kept raw wire literal separate; required current official evidence before changing acceptance and offline rotation/persistence/error coverage; distinguished runtime-only and OAuth generation/release order. **Pass.**          |
| `internal-release` / `/root/cleanup_regression_release`  | 3/3 pass          | Confirmed private/internal classification and no managed release membership; stopped publication and required separate reclassification review; treated impact as a review input. Actual topology check passed and its release gate rejected the private target as expected. **Pass.** |
| `rust-generated-model` / `/root/cleanup_regression_rust` | 4/4 pass          | Traced model to OpenAPI/schema/mapping and Rust generator; distinguished shared-contract versus Rust-only graph; preserved Cargo/authored content, proposed freshness/Rust checks with explicit limits, and reviewed independent release order. **Pass.**                              |

Structural scenario validation also passed in the repository verification phase;
that automated result is separate from the manual semantic grading above.
