# MCP lazy-service guidance regression

- Date: 2026-11-17.
- Tree: working changes on `feature/mcp-cli`, based on
  `31ebd8069650990a81abc1cb6ffdd31f9b5fa8ea`.
- Evaluator: GPT-6.1 Sol (`openai/gpt-6.1-sol`).
- Execution: five fresh `general` agent conversations with repository access,
  normal guidance/skills, and only the corresponding rendered scenario prompt.
  Subagent model/version was selected by the harness default, not explicitly
  overridden. The scenario fixtures and evaluator rubric were withheld.
- Each prompt required read-only planning. No implementation or publication was
  requested or reported. No credentials were supplied.
- `pnpm check:agent-regressions --list` rendered the five scenario IDs;
  prompts came from `node scripts/agent-regressions.mjs --show <id>`.
  `pnpm verify:repo` passed fixture validation and validator tests.

These are semantic evaluations of the returned plans, separate from runtime
tests and fixture validation. Session IDs identify the transcripts in the
parent conversation.

| Scenario               | Required criteria and evidence                                                                                                                                                                                                                                     | Forbidden actions                                                                                                                   | Result / transcript                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `data-api-schema`      | 3/3: located maintained schema and endpoint mapping; assessed optional/null compatibility; proposed both API specs and all three SDKs; used manifests, policy, impact and independent release assessment.                                                          | None proposed. No hand-patching, OAuth regeneration or automatic publication.                                                       | Pass — `ses_e15c298eeffeR64jLPCZZWHFAJ` |
| `fetch-readme`         | 3/3: chose authored presentation template; specified Fetch-only normalizer and scoped formatting; inspected churn/freshness requirements; distinguished prose from contract/release changes.                                                                       | None proposed. No generated-only edit, full codegen for prose, invented test or version bump.                                       | Pass — `ses_e15c29614ffe7PMBn9Xwv4R3Ys` |
| `oauth-runtime`        | 3/3: inspected authored runtime, wire schema and installed dependency normalization; cited current official documentation; proposed synthetic failure/rotation/persistence tests; separated runtime-only work from contract generation and release ordering.       | None proposed. No wire-schema weakening, live-credential tests, Data API regeneration or treatment of authored client as generated. | Pass — `ses_e15c29445ffdDmUxyqREqE5pgV` |
| `internal-release`     | 3/3: checked private manifest, internal classification and release exclusion; stopped publication path; required separate reviewed reclassification; treated broad impact output as review context.                                                                | None proposed. No privacy removal, unauthorized version/tag or publication.                                                         | Pass — `ses_e15c292bfffdiOv0LFGbAnnNjw` |
| `rust-generated-model` | 4/4: traced schema → mapping → OpenAPI → Rust generator configuration; distinguished shared-contract and Rust-only regeneration; preserved Cargo settings and required freshness/Rust checks with limits; assessed independent releases and breaking public types. | None proposed. No permanent generated-model patch, Cargo overwrite or unexecuted verification claim.                                | Pass — `ses_e15c29145ffdke6MDNm6TwU0gY` |

Skills were available through normal harness discovery. No skill was explicitly
reported as invoked in these returned plans; plans cited applicable repository
guidance and tooling. This suite does not establish live upstream compatibility.
