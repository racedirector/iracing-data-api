# Evidence and report contract

Start with **Compatible**, **Compatibility issues found**, or **Unable to verify part of the contract**. Identify current revision/dirty paths, scope, packages discovered, current authoritative sources examined, retrieval time, and any credential/service limitations. State clearly when live retrieval was unavailable. Never present a tracked fixture or earlier audit output as current upstream truth.

Build one row per meaningful endpoint/parameter/protocol rule:

| Surface        | Current upstream fact and source                                        | Current schema/input-output                                | Client/runtime                      | Mapping/generated/docs/tests    | Result and interpretation             |
| -------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------- |
| Endpoint/field | Official/current source URL and relevant JSON pointer/section; unknowns | Required/optional/null/conditional, coercion, unknown keys | Validation, encoding, calls, errors | Actual representations/coverage | Match/mismatch/ambiguous/out of scope |

Group findings by P1 (likely rejected valid response/invalid request, authentication/security or runtime failure), P2 (meaningful discrepancy or forward compatibility/recovery gap), P3 (optional capability/docs/hardening). Assess breaking impact separately. Each finding must include:

- **Current upstream fact:** exact authoritative source, retrieval time for the current audit, relevant JSON pointer/section, and documented rule; mark unknowns. Historical evidence is required before calling a difference a confirmed upstream change.
- **Repository mismatch:** current file/symbol and observed acceptance/construction/parsing or representation, including raw wire versus normalized behavior. Use careful negative evidence: searched paths/symbols, not an unsupported absence claim.
- **Interpretation:** recommendation, confidence, severity, and classification (current mismatch, confirmed upstream change when history proves it, unsupported capability, internal bug, ambiguous documentation, or no action).
- **Canonical owner:** authored source layer/path, relevant guidance, and why it owns the fix; generated destinations and regeneration edge, if applicable.
- **Downstream impact:** current package names/versions, source consumers, generated signatures/models, docs/examples, and actual dependency/generation edges.
- **Required tests:** concrete acceptance/rejection/serialization/error cases, existing coverage, package commands discovered, and any authenticated/manual evidence needed. Do not invent scripts or treat source inspection as server validation.
- **Breaking implications:** yes/no/possibly with rationale for input acceptance, output/types, requiredness, operation IDs, export/signature changes, consumers and migration; assess independent packages separately.
- **Implementation and release order:** canonical schema/mapping fixes before generated specs/SDKs and consumers, runtime-only fixes at their owner, downstream tests and migration before independently versioned releases. Use current manifests, managed release configuration and release guide; publication is outside the audit.

Report these layers separately:

- **Docs diff:** expected/matched routes and parameters, classified candidates,
  and current source/retrieval time.
- **Live authored input/output cases:** expected endpoints and schema bindings;
  PASS / CONTRACT_MISMATCH / BLOCKED / NOT_RUN counts and sanitized reasons.
  Account for templates/variants and missing cases; do not count mocked dispatch
  or an absent live suite as successful server validation.
- **Selected linked payloads:** only the bounded cases required by changed
  command-owned interpretation. An envelope pass does not validate linked JSON,
  CSV, or chunks.
- **Offline repository checks:** canonical schema/adapter tests, builds, and
  generated freshness. These are not tests of generator internals or evidence
  of current upstream compatibility.

Each changed case includes the affected command and **add / modify / retain /
retire** decision with rationale. Retaining a command after a schema-only repair
is valid; deleting a failing case or weakening acceptance without evidence is not.
A Zod parse pass establishes acceptance of that response, not schema completeness,
every optional filter's semantics, or all success/error variants.

## Living decision memory

Update [the reconciliation log](../../../../docs/DATA-API-RECONCILIATION.md)
whenever contract changes are made. Record a stable finding ID, dated observations
and reviews with timezone, base git commit/dirty-tree context, implementation
commits (or explicitly pending), official source locations, mismatch versus
interpretation, decision and rationale, canonical owners, compatibility impact,
validation/regeneration commands and outcomes, limitations, and next-review cases.
Do not commit solely to obtain a reference or invent an implementation commit.

At the next reconciliation, review previous findings and decisions against fresh
official documentation and live cases before deciding **retain / revise / revert**.
For example, corrected official definitions or a method now conforming to its
documented contract may remove the reason for a workaround. Record the new dated
decision and evidence without deleting the old rationale. A blocked recheck stays
explicitly unverified. Historical log entries are not current upstream authority.
Never store raw responses, credentials, private identifiers or signed URLs here.

End with checked/no-action surfaces, official documentation and endpoint coverage
(including unavailable ones), executed/skipped validation, credentials/freshness/
dirty-tree limitations, open ambiguities, and a consolidated dependency-aware
implementation/release sequence. If the requested full live gate is absent or
blocked, finish **Unable to verify part of the contract**. Docs-only verdicts must
say docs-only. A service-free fixture pass validates audit mechanics only; it is
never a current compatibility verdict.
