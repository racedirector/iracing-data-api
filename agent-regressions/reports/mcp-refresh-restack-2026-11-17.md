# MCP refresh restack guidance regression

- Date: 2026-11-17.
- Tree: `restack/pr-558`, based on `10d3f66e5fd61615623d1e7462bff97e5693de92`,
  with the refresh-only port of `1255bac91902e9d1a9a2216fe2ad7ceebd061458`.
- Evaluator: GPT-6.1 Sol (`openai/gpt-6.1-sol`).
- Reason: the port retains a small onboarding-skill note for local refresh.
- Execution: five fresh `general` conversations, using harness-default models,
  with the corresponding rendered scenario prompts, checkout access and normal
  guidance/skill discovery. Rubrics, scenario fixtures and prior reports were
  withheld. Each conversation was explicitly read-only; no credentials supplied.
- `pnpm check:agent-regressions --list` and all five `--show` commands ran.
  Fixture validation is separate from the semantic evaluation below.

Session IDs identify answer transcripts in the parent conversation.

| Scenario               | Required criteria and evidence                                                                                                                                                                                                                                             | Forbidden actions                                                                                | Result / transcript                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `data-api-schema`      | 3/3: identified authored response schema and endpoint mapping, distinguished linked payloads and optionality, planned both Data API specs and all three clients, reviewed policy/manifests and impact with independent releases.                                           | None proposed; no generated hand-patches, OAuth regeneration or automatic release of candidates. | Pass — `ses_e1408336cffduxfFb2H85Ll0tQ` |
| `fetch-readme`         | 3/3: identified `scripts/client-presentation/fetch.md`, specified Fetch-only normalization and generated formatting, reviewed unrelated churn and freshness checks, distinguished introductory prose from contract/release changes.                                        | None proposed; no generated-only edit, full codegen for prose, invented test or automatic bump.  | Pass — `ses_e1407dc84ffdmDoq1xN8467gWA` |
| `oauth-runtime`        | 3/3: inspected authored client/schema and existing normalized-token bridge, required dependency reproduction and official evidence before any wire change, planned synthetic failure/rotation/persistence tests, separated runtime-only work from generation and releases. | None proposed; no schema weakening for dependency behavior, live tests or Data API regeneration. | Pass — `ses_e1407db96ffd29rkh1PwjdNWHd` |
| `internal-release`     | 3/3: checked private manifest, internal policy classification and managed release exclusion; stopped publication, required separately reviewed reclassification and treated downstream impact as review input.                                                             | None proposed; no privacy change, tag, version bump, registry contact or publication.            | Pass — `ses_e1407dabbffd0u2nR70sxlBH2L` |
| `rust-generated-model` | 4/4: traced model through authored schema/mapping and generator, distinguished shared-contract and Rust-only generation, preserved Cargo settings, planned freshness/Rust checks with toolchain limits, assessed independent release ordering and source compatibility.    | None proposed; no permanent generated patch, Cargo overwrite or unexecuted pass claim.           | Pass — `ses_e1407da0bffdidSfORgCiJs4nz` |

The release conversation reported applying `npm-release`; other plans cited
scoped guidance without reporting a skill invocation. OAuth dependency behavior
was identified as an evidence-gathering prerequisite, not claimed as newly
verified. No conversation ran implementation checks or claimed live compatibility.
These planning results do not imply that the runtime suite or full verification
passes; those results are reported separately in the PR.
