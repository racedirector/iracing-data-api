# CLI contract skill review and agent regressions

## Evaluated tree and scope

- Branch: `feature/cli-refactor`; base revision: `35ae096`.
- Tree: dirty before this task, containing the CLI/API reconciliation and unrelated
  OAuth/tooling work. No commit, cleanup/reset, release, or publication was made.
- This task changes guidance and its service-free regression assertions only:
  package-local API-command skill/reference, repository skill routing and audit
  references, `docs/UPSTREAM-CONTRACT.md`, and this review.
- Evaluator: GPT-6.1 Sol, `openai/gpt-6.1-sol`, through OpenCode.
- Subjects: seven fresh `general` agent sessions using the configured harness
  default. The subagent tool does not expose a separate child model/version ID;
  that metadata is unavailable rather than inferred.
- Subject tools: normal checkout read/search/shell/skill tools. Each prompt
  required read-only planning; the two additional skill exercises also prohibited
  live services, credentials, generation, and publication.

The five fixture prompts were rendered from the current
`agent-regressions/scenarios.json` without supplying its rubric or prior answers.
The evaluator graded the returned answers against every required/forbidden
criterion. Fixture validation is recorded separately from model evaluation.

## Skill audit

| Finding in the former workflow                                                                       | Resolution                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Docs retrieval and a narrow structural comparator already had the correct generated-client boundary. | Preserved; current docs precede case planning, and the same private response is reused for before/after comparison.                                                                                                             |
| Repository command skill duplicated package implementation instructions.                             | Repository `cli-command` now routes to the package-local `api-command` skill instead of maintaining a second recipe.                                                                                                            |
| Auth recovery was insufficiently operational.                                                        | Added configured CLI login, explicit credential selection, overwrite authorization, and separate operator actions for configuration, rejection, expiry/access, rate limits, and service failures. No retry/grant fallback loop. |
| All-client generation was the only described maintenance loop.                                       | Documented Fetch-only development regeneration/build, followed by all affected Data API clients after scoped validation. No OAuth generation solely for login.                                                                  |
| Structural agreement and successful parsing could be mistaken for complete reconciliation.           | Separated docs, live authored input/output cases, selected payload interpretation, and offline repository checks; incomplete coverage cannot receive a full-live compatible verdict.                                            |
| No executable all-endpoint live contract suite exists, and response-only support is partial.         | Recorded the blocking runtime gap explicitly. No fake script or claim that prose implements a test runner.                                                                                                                      |
| Prior successful raw-envelope checks would miss linked CSV/JSON interpretation problems.             | Additional materialization is bounded to changed command-owned interpretations, not blanket link/chunk crawling.                                                                                                                |
| Test ownership and command consequences were unclear.                                                | Test canonical inputs/outputs against the real endpoint, not generated internals. Each changed case records add/modify/retain/retire; schema-only fixes may retain commands with rationale.                                     |

The proposed live gate is intentionally minimal: one representative valid case
per declared endpoint, plus cases justified by changed authored rules. Reviewed
selectors/prerequisites replace synthetic placeholder IDs. Canonical raw-response
validation and documented success conditions are the subject; CLI/generated
clients are transport. No exhaustive flag permutations or generated model/class/
decoder assertions are prescribed.

## Five required fresh-conversation scenarios

`R1`, `R2`, etc. below refer in order to the scenario's existing `required`
criteria, not newly relaxed criteria. No forbidden proposal was observed.

| Scenario               | Required criteria | Forbidden actions | Result | Transcript identifier and grading evidence                                                                                                                                                                                                                                          |
| ---------------------- | ----------------- | ----------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-api-schema`      | R1/R2/R3 pass     | None              | Pass   | `ses_e23143205ffeXDCnxfTuyIR6Tz`: located canonical schema/mapping, required current evidence and optionality review; planned both API formats/all Data API clients; used manifests/impact and separated dirty-tree OAuth candidates from isolated release scope.                   |
| `fetch-readme`         | R1/R2/R3 pass     | None              | Pass   | `ses_e23143154ffdZ2Yl8wdeirJjeI`: selected authored presentation Markdown and scoped normalizer/formatting, reviewed generated diffs/freshness, avoided contract/runtime changes and invented package tests.                                                                        |
| `oauth-runtime`        | R1/R2/R3 pass     | None              | Pass   | `ses_e231430a3ffe5iU7k3gWviUmFZ`: distinguished current official wire `Bearer` from dependency lowercase normalization and the existing authored bridge; proposed focused synthetic lifecycle tests, runtime-only generation decision, and independently scoped consumers/releases. |
| `internal-release`     | R1/R2/R3 pass     | None              | Pass   | `ses_e23142ff1ffeL2QJmb4McOPVPk`: identified private internal helper, ran the release eligibility check and correctly stopped publication; treated impact as review input, not authorization.                                                                                       |
| `rust-generated-model` | R1/R2/R3/R4 pass  | None              | Pass   | `ses_e23142f10ffd0czixiT9qlAb5K`: traced schema/mapping/OpenAPI/generator options before choosing an owner; distinguished Rust-only from shared generation; preserved Cargo intent and proposed freshness/Rust checks with honest limitations and independent version review.       |

These transcripts are the fresh session records in the harness. All subjects
reported no edits or publication. Some fixture subjects ran read-only impact or
eligibility checks; the OAuth subject consulted public official documentation.
None performed authenticated Data API tests. Their proposed verification commands
are not recorded as executed checks.

## Additional skill-specific exercises

| Exercise                                                                                       | Result | Evidence                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Discover skills and plan adding `lookup/current_season` without duplicating existing work.     | Pass   | `ses_e2313dbe6ffdQHapDObY9EmlaM`: discovered repository wrapper and package skill; located the existing command/schema binding, chose retain/no duplicate change, identified missing lookup response-only support and live suite, and prohibited generated-client test additions. |
| Assess a full verdict after clean docs, passing mocked dispatch, and one successful Zod parse. | Pass   | `ses_e2313d695ffdBPN2pJeWlQCSai`: rejected a full compatible verdict; identified the actual runtime gaps, minimal authored input/output gate and classifications, raw/pre-normalization boundary, limited payload checks, and error-specific auth recovery.                       |

## Executable guidance validation

- `pnpm test:compatibility-audits`: 23 tests passed, including routing, ordered
  phases, auth recovery, authored-contract-only subject, missing-gate handling,
  command accountability, and local Markdown-link resolution.
- `pnpm check:agent-regressions`: five fixture definitions/references validated.
- `pnpm test:agent-regressions`: eight validator tests passed.
- Focused ESLint for the edited guidance test passed.
- Full `pnpm verify` passed, including existing repository consistency checks.
  Those checks are separate from the live authored-contract gate.
- No contract changes or checked-in generated-output changes were required for
  this guidance task. No authenticated API calls were made by the evaluator.

The live-contract runner and missing response-only commands remain separate
runtime implementation work. These guidance/model checks do not establish
current API compatibility and must not be reported as live endpoint coverage.
