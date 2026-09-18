---
name: iracing-oauth-compatibility-audit
description: Audit this repository's iRacing OAuth schemas, client behavior, generated contract, tests, and docs against the current official iRacing Auth Service documentation. Use for protocol-drift, release-readiness, or OAuth compatibility reviews; do not use for a generic OAuth review.
---

# iRacing OAuth compatibility audit

Determine whether the current official iRacing Auth Service contract and this repository's implementation remain semantically compatible. Produce evidence-backed recommendations; do not edit production code, tests, generated output, or package documentation unless the user explicitly asks for implementation.

## Sources and authority

1. Read all applicable repository instructions and inspect the current working tree.
2. Start live research at <https://oauth.iracing.com/oauth2/book/introduction.html>. Traverse the current book navigation and official-domain search results; do not assume the saved page list is exhaustive.
3. Treat current official iRacing documentation as the source of truth for current behavior. Use general OAuth specifications only to explain context or fill a clearly identified gap, never to override an iRacing-specific rule.
4. Read [references/repository-map.md](references/repository-map.md) as a starting map, then verify every relevant path, export, dependency, and symbol against the current tree.
5. Read [references/audit-method.md](references/audit-method.md) for the comparison matrix, protocol surfaces, evidence rules, severity rules, and reporting template.
6. Read [references/protocol-baseline.md](references/protocol-baseline.md) only when comparing with the last recorded audit or deciding whether a mismatch is a confirmed upstream change. The live documentation remains authoritative.

If live official documentation cannot be accessed, begin the result with **Unable to verify part of the protocol**, identify exactly what could not be checked, and do not present the saved baseline or model knowledge as current upstream truth.

## Audit workflow

### 1. Rebuild the repository inventory

Inspect rather than trusting the saved map. At minimum, locate:

- workspace/package-manager configuration and applicable instructions;
- OAuth schema and runtime-client packages, their manifests, exports, dependency direction, and public APIs;
- Zod schemas, inferred types, constants, literals, request builders, query/form encoding, response/error parsing, storage, refresh, PKCE, masking, scope, JWT, rate-limit, revocation, and protected-resource behavior;
- tests, fixtures, examples, READMEs, OpenAPI generators, and checked-in generated contracts that encode the wire protocol; and
- relevant git history, tags, and prior audit baselines.

Use targeted `rg`, `rg --files`, package manifests, and source reads. Inspect tests before calling behavior unsupported. Preserve user changes and do not regenerate outputs during an audit.

### 2. Discover the current official contract

From the documentation entry point, enumerate the relevant current pages and record every page actually examined. Cover all implemented surfaces and newly documented adjacent capabilities, including:

- flows, client types/roles, `/authorize`, `/token`, grants, redirects, and content types;
- PKCE, masking, scopes, token lifecycles, access-token claims and verification;
- error redirects, JSON errors, codes, statuses, headers, and throttling;
- profile, sessions, revocation, Data API authentication, and other endpoints within the packages' apparent scope.

Capture semantics rather than prose: method/path, authentication, encoding, fields, exact literals, required/optional/nullable/conditionally included status, defaults, cross-field conditions, lifecycle rules, and extension points. Keep tokens and codes opaque wherever the docs require it.

### 3. Compare every representation

Build the contract matrix described in the audit method. Compare the live contract independently with:

1. `@iracing-data/oauth-schema` runtime schemas and inferred/exported types;
2. `@iracing-data/oauth-client` construction, parsing, validation, storage, refresh, and error behavior;
3. generated OpenAPI inputs/output;
4. tests and fixtures; and
5. package docs and examples.

Do not equate matching names with compatibility. Test conditional requirements, casing, URL/form encoding, absent versus `null`, forward-compatible server values, rotation/reuse, and information preserved in errors. Inspect third-party boundary helpers when they may normalize or validate data before repository code sees it. Distinguish the raw wire contract from normalized dependency output, request acceptance from response acceptance, and decoded-JWT convenience APIs from core token handling.

For each discrepancy, explicitly assign ownership to **schema package**, **client package**, **both**, or **tests/docs only**. A documented feature outside the library's apparent responsibility is not automatically a bug.

### 4. Establish change provenance

Use the baseline and git history when useful. Say **confirmed upstream change** only when an authoritative historical source, checked-in baseline, or prior official capture proves an earlier contract. Otherwise use one of:

- current compatibility mismatch;
- unsupported capability;
- implementation bug;
- ambiguous documentation; or
- no action required.

Prefer “the current documentation specifies X while the repository implements Y” over an unsupported claim that iRacing changed X.

### 5. Report; do not mutate

Return the required report format from [references/audit-method.md](references/audit-method.md). Cite exact official pages with links and exact repository files/symbols, adding line links when stable in the current checkout. Include negative evidence carefully: “no matching implementation found after searching …” rather than claiming absence from a partial scan.

Recommend concrete changes and tests, including likely public API impact and dependency-aware implementation order. Do not make the changes unless the user explicitly requests them.

## Completion criteria

An audit is complete only when it:

- states **Compatible**, **Compatibility issues found**, or **Unable to verify part of the protocol**;
- covers every implemented protocol surface and records official documentation coverage;
- separates schema/type discrepancies from runtime behavior;
- distinguishes confirmed change from current mismatch and optional capability;
- groups findings into P1, P2, and P3 with all required evidence fields;
- includes checked/no-action surfaces and a recommended implementation order; and
- clearly states any limits, ambiguity, unavailable pages, or skipped validation.
