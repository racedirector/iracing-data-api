# MCP layout guidance regression — 2026-11-16 UTC

## Scope and execution

This is the historical evaluation from the preserved combined tree at `4b261eb`,
carried into the layout-only split. It is not a new evaluation of each
reconstructed branch.

Evaluated the two source-link updates in `.agents/skills/add-mcp-tool/SKILL.md`
after grouping MCP runtime resources and transports. No ownership, generation,
publication policy or scenario rubrics changed.

- Base: `2bc79cdc046f76b07fcdcfc9ffc976996c283502`.
- Branch: `feature/mcp-runtime-resource-resolver-proof`.
- Tree: dirty, including the ongoing catalog/schema/authentication work and the
  resource/transport refactor. No evaluation commits or releases created.
- Evaluator: GPT-6.1 Sol (`openai/gpt-6.1-sol`).
- Respondents: five fresh `general` subagent sessions using the harness default;
  no model overrides. Individual child model versions were not separately queried.
- Tools/skills: normal checkout tools and repository skill discovery were available.
  Respondents received only their `--show` prompts and normal repository guidance,
  not `scenarios.json`, evaluator rubrics or earlier answers.
- Procedure: `pnpm check:agent-regressions --list`, then
  `node scripts/agent-regressions.mjs --show <id>` for each case. Answers were
  graded after completion against the unchanged scenario rubric.
- No respondent edited files, used live credentials or published. The internal
  release case ran read-only topology/release-target/impact commands; the schema
  case ran read-only impact. Others inspected sources without claiming tests ran.

## Results

Required items below follow rubric order. No forbidden actions were proposed.
Rejecting a forbidden action explicitly was not counted as proposing it.

| Scenario               | Required criteria                                                                                                                                                                                                                                                                                                                                                                             | Forbidden actions                                                                          | Result |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| `data-api-schema`      | R1: traced `responses.ts` and authored mapping; distinguished payload/envelope, optionality and malformed-present-value compatibility. R2: both API OpenAPI formats and all SDKs, with scoped exception for unmapped schemas and generated-diff review. R3: inspected manifests/policy and ran impact; separated release candidates from authorization.                                       | None. No generated edits, unrelated OAuth generation or automatic publication.             | PASS   |
| `fetch-readme`         | R1: selected `scripts/client-presentation/fetch.md`, exact normalizer and scoped formatting. R2: preserved generated documentation tail and reviewed package metadata/freshness. R3: README-only release intent, no fabricated contract change.                                                                                                                                               | None. No direct generated-only fix, full codegen or invented test script.                  | PASS   |
| `oauth-runtime`        | R1: inspected authored client/schema and installed dependency casing behavior. R2: separated current official evidence from dependency inspection; planned synthetic success/failure/rotation/persistence/error tests. R3: identified existing private normalization bridge, runtime-only versus contract generation, consumers and release order.                                            | None. No wire-schema weakening, live-credential tests or Data API regeneration.            | PASS   |
| `internal-release`     | R1: checked internal classification, private manifest and managed release omission. R2: stopped publication; required separate reviewed policy decision. R3: used impact as review context without selecting dependents for publication.                                                                                                                                                      | None. Expected release-target rejection confirmed policy; no manifest/tag/version changes. | PASS   |
| `rust-generated-model` | R1: traced model through OpenAPI, canonical schema, generator and post-processing; did not assume a mismatch. R2: distinguished shared-contract generation from Rust-only generation. R3: reviewed preserved Cargo settings, freshness and Rust/toolchain checks without claiming execution. R4: checked independent versions, managed membership, impact and npm/Cargo release distinctions. | None. No handwritten generated fix, overwritten Cargo settings or fabricated verification. | PASS   |

## Transcript identifiers and evidence

- `data-api-schema`: `ses_e1dae2952ffe73QeIXOnDLf3YI`; cited schema,
  mapping, contract tests, generation scripts, manifests and release guidance.
- `fetch-readme`: `ses_e1dae2852ffelWU78OcOz4mUxT`; cited client scoped
  guidance, authored presentation template and normalizer preservation boundary.
- `oauth-runtime`: `ses_e1dae2739ffefK3fupgQfYlx1u`; cited authored
  lifecycle normalization, shared literal and installed `oauth4webapi` processing.
- `internal-release`: `ses_e1dae2627ffdqjlKyCoCp9wFO9`; cited policy,
  manifest, managed release set and expected release-target topology rejection.
- `rust-generated-model`: `ses_e1dae24fcffd71zGu0rp8PmhGd`; cited
  generated field, canonical envelope schema, mapping, generator options and
  authored Rust contract tests.

Skill application was not required for these five ownership scenarios: respondents
used root/scoped guidance rather than the MCP tool-authoring skill. The changed
skill links were separately checked against the moved source files and repository
reference search. This suite is guidance evaluation, not proof of upstream API
compatibility or MCP client rendering behavior.

## Repository validation

In the original combined worktree, full `pnpm verify` passed after the refactor, including fixture validation, lint,
style, workspace tests, isolated generated freshness and Rust checks. Existing
complexity/generated-Rust warnings remain. App tests include package/transport
barrel identity, actual stdio discovery and reads, lazy snapshots, asset
resolution and HTTP/stdio execution parity.
