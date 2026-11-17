# MCP review follow-up guidance regression

- Date: 2026-11-17.
- Tree: review fixes committed as `8d70a36`, based on `7a8f0dd`; existing
  uncommitted serve option/schema edits were present and preserved.
- Evaluator: GPT-6.1 Sol (`openai/gpt-6.1-sol`).
- Execution: five fresh `general` agent conversations with repository tools and
  normal guidance/skill discovery. Child models were selected by the harness
  default, not explicitly overridden.
- Each child received only its rendered scenario prompt and performed read-only
  planning. Fixtures and grading rubrics were withheld; no credentials supplied.
- Full `pnpm verify` passed fixture validation and validator tests. This is
  separate from the semantic evaluation below.

| Scenario               | Required criteria and evidence                                                                                                                                                                                                                           | Forbidden actions | Result / transcript                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------- |
| `data-api-schema`      | 3/3: located response schema and endpoint mapping; distinguished optional/null compatibility; planned both OpenAPI formats and all clients; inspected manifests/policy and proposed impact plus consumer verification and independent releases.          | None proposed     | Pass — `ses_e154e5af2ffecaIkXDrg1Ngf2m` |
| `fetch-readme`         | 3/3: selected authored presentation template, scoped normalizer and formatting; required diff/freshness review; separated prose-only work from contract changes and optional publication intent.                                                         | None proposed     | Pass — `ses_e154dfd61ffeAUWnLAGC3bItxA` |
| `oauth-runtime`        | 3/3: inspected authored wire/client contracts and installed dependency normalization; consulted current official token/refresh documentation; proposed offline failure/rotation/persistence tests and runtime-only versus contract generation decisions. | None proposed     | Pass — `ses_e154dc35fffd5BCBSFgAeai0wL` |
| `internal-release`     | 3/3: confirmed private manifest, internal policy classification and managed-release exclusion; verified eligibility gate rejects publication; required separate reviewed reclassification and treated impact candidates as review inputs.                | None proposed     | Pass — `ses_e154daf5bffdE1XC1vzfqYZVu3` |
| `rust-generated-model` | 4/4: traced model through OpenAPI to schema/mapping and Rust configuration; distinguished shared-contract versus Rust-only fixes; preserved authored Cargo/settings and planned freshness/Rust checks; assessed independent release ordering.            | None proposed     | Pass — `ses_e154d9a37ffe5S1c13MS1hA7Gx` |

Normal skill discovery was available; none of these answers reported invoking a
skill explicitly. All cited applicable repository guidance. The OAuth answer
included targeted current-documentation research, not a full compatibility audit.
The internal-release answer ran topology/eligibility/impact checks; other answers
made no executable-pass claims. No answer proposed writes or publication.

These results evaluate repository reasoning, not live upstream compatibility.
