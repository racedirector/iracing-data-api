# Evidence and report contract

Start with **Compatible**, **Compatibility issues found**, or **Unable to verify part of the contract**. Identify current revision/dirty paths, scope, packages discovered, official sources examined, and evidence mode/time/hash/version. State fixture or stale evidence limits before findings. Never call an unperformed authenticated capture successful.

Build one row per meaningful endpoint/parameter/protocol rule:

| Surface        | Upstream fact and evidence                  | Current schema/input-output                                | Client/runtime                      | Mapping/generated/docs/tests    | Result and interpretation             |
| -------------- | ------------------------------------------- | ---------------------------------------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------- |
| Endpoint/field | Source URL, snapshot hash/pointer; unknowns | Required/optional/null/conditional, coercion, unknown keys | Validation, encoding, calls, errors | Actual representations/coverage | Match/mismatch/ambiguous/out of scope |

Group findings by P1 (likely rejected valid response/invalid request, authentication/security or runtime failure), P2 (meaningful discrepancy or forward compatibility/recovery gap), P3 (optional capability/docs/hardening). Assess breaking impact separately. Each finding must include:

- **Upstream fact:** exact official source, capture provenance/hash/pointer, and documented rule; mark unknowns. Historical evidence is required to call it a confirmed upstream change.
- **Repository mismatch:** current file/symbol and observed acceptance/construction/parsing or representation, including raw wire versus normalized behavior. Use careful negative evidence: searched paths/symbols, not an unsupported absence claim.
- **Interpretation:** recommendation, confidence, severity, and classification (confirmed upstream change, current mismatch, unsupported capability, internal bug, ambiguous documentation, or no action).
- **Canonical owner:** authored source layer/path, relevant guidance, and why it owns the fix; generated destinations and regeneration edge, if applicable.
- **Downstream impact:** current package names/versions, source consumers, generated signatures/models, docs/examples, and actual dependency/generation edges.
- **Required tests:** concrete acceptance/rejection/serialization/error cases, existing coverage, package commands discovered, and any authenticated/manual evidence needed. Do not invent scripts or treat source inspection as server validation.
- **Breaking implications:** yes/no/possibly with rationale for input acceptance, output/types, requiredness, operation IDs, export/signature changes, consumers and migration; assess independent packages separately.
- **Implementation and release order:** canonical schema/mapping fixes before generated specs/SDKs and consumers, runtime-only fixes at their owner, downstream tests and migration before independently versioned releases. Use current manifests, managed release configuration and release guide; publication is outside the audit.

End with checked/no-action surfaces, official documentation and endpoint coverage (including unavailable ones), executed/skipped validation, credentials/freshness/history/dirty-tree limitations, open ambiguities, and a consolidated dependency-aware implementation/release sequence. A zero diff is evidence of unchanged normalized upstream content only; it is never a complete compatibility verdict.
