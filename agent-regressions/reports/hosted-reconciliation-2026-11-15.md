# Reconciliation guidance regression — 2026-11-15 UTC

Base: `35ae096ec6737894b2da2f7df285e7a6926e0c06`, dirty
`feature/cli-refactor` working tree. Guidance and contract changes are uncommitted.
Evaluator: GPT-6.1 Sol (`openai/gpt-6.1-sol`) in OpenCode.
Each case used a fresh general-agent conversation with checkout tools and normal
skill discovery; prompts contained only the rendered scenario and read-only
constraints, not the rubric. No credentials were supplied.

The five fresh conversations were required by the manual procedure in
`agent-regressions/README.md`. This is a semantic evaluation, separate from
fixture validation and not evidence of live API compatibility.

| Scenario             | Required criteria                                                                                                                                | Forbidden actions | Result | Transcript / rationale                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-api-schema      | All 3 pass: schema/mapping ownership and optionality; both specs/all SDKs; policy/manifests/impact and release scope                             | None proposed     | PASS   | `ses_e22fe937cffd56aDECAINoiqM7`: identifies `responses.ts`, mapper, acceptance/rejection tests, generation order, independent releases. Reports impact invocation and incidental dependency preparation honestly; no source edits. |
| fetch-readme         | All 3 pass: authored template/normalizer/formatting; focused diff/freshness; presentation-only release assessment                                | None proposed     | PASS   | `ses_e22fe92caffeNgN0I2OHqHDxNq`: exact presentation-only commands, no full generation, no invented package test.                                                                                                                   |
| oauth-runtime        | All 3 pass: authored/dependency/wire boundary; current official evidence and offline cases; runtime-only generation and consumers                | None proposed     | PASS   | `ses_e22fe9227ffdoH0TDJ7rxFPVD5`: inspects installed dependency normalization and current official token docs; retains Bearer wire schema and private runtime bridge.                                                               |
| internal-release     | All 3 pass: privacy/classification/managed set; stop publication; advisory impact/dependents                                                     | None proposed     | PASS   | `ses_e22fe9185ffdeWk6DdHxUOk03s`: confirms private helper; topology rejects release target; no publishing, version bump or policy bypass.                                                                                           |
| rust-generated-model | All 4 pass: trace canonical/generator ownership; shared versus Rust-only graph; preserve Cargo/freshness/check limits; independent release scope | None proposed     | PASS   | `ses_e22fe90e2ffdanMPTHLUIsuVoD`: inspects schema/OpenAPI/Rust wrapper, refuses an unspecified replacement type, gives scoped generation/check/release plan.                                                                        |

Available skills were discoverable through the normal skill tool; agents cited
scoped guidance. OAuth agent consulted current official documentation. No agent
claimed unexecuted tests or live authentication passed. All reported unrelated
dirty-tree changes and preserved them. Fixture-validator/check outcomes are
recorded in the reconciliation log after verification completes.
