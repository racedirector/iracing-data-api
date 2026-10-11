---
name: iracing-data-api-compatibility-audit
description: Audit the repository against the current authoritative iRacing Data API documentation without treating persisted captures or fixtures as current upstream truth.
---

# iRacing Data API compatibility audit

Use this skill to compare the current repository with current authoritative iRacing Data API documentation. The audit is read-only by default. Do not edit schemas, generated output, runtime code, versioning, or release metadata unless the user explicitly asks for implementation after the audit.

## Authority and ownership

Follow [root guidance](../../../AGENTS.md), the nearest scoped guidance for files under review, and the current working tree. Current code and maintained schema/OpenAPI sources are authoritative for repository behavior.

For upstream facts, retrieve current authenticated Data API documentation during the audit through `iracing-data docs`. That command uses the generated Data API client. Do not use a handwritten/root-script modeled-service client.

Do not treat tracked fixtures, previous audit output, attached JSON, hashes, or historical captures as current upstream authority. A supplied document may help explain history, but current compatibility claims require current authoritative retrieval when access is available. If live retrieval cannot be performed, state **Unable to verify part of the contract** and identify exactly what remains unverified.

Modeled service calls and opaque returned links have different owners. Modeled Data API calls stay behind generated clients. Applications may resolve opaque signed/cache/chunk URLs returned by typed Data API responses, including validation, TTL/caching, coalescing and retention; do not flag that application data-plane behavior as a generated-client bypass.

## Workflow

1. Record the current revision, branch, dirty paths, audit scope, requested endpoint(s), and available credentials/access. Preserve unrelated changes and build the runtime inventory from the current tree rather than assuming documentation is current.
2. Read [current compatibility tooling](../../../docs/UPSTREAM-CONTRACT.md) and [the live workflow](references/live-workflow.md). Build the CLI and schema/OpenAPI comparison dependencies. Retrieve the current Data API documentation once for this audit run through `iracing-data docs`.
3. Feed the plain current documentation map to [`scripts/audit-data-docs.cjs`](../../../scripts/audit-data-docs.cjs), either through stdin or a temporary file. The comparator owns structural route/reference/parameter comparison only; it does not own network transport, credentials, persistence, provenance, hashing or historical diffing.
4. Inspect current maintained schema, endpoint mapping, generated clients, runtime consumers, tests and examples for every finding. `/data/doc` is not a complete endpoint-response schema, so separately review response-shape assumptions, conditional rules, enum/range notes, coercion and serialization where relevant.
5. Classify each finding as a current repository mismatch, unsupported capability, internal bug, ambiguous/insufficient upstream documentation, or no action. Call something a confirmed upstream change only when historical evidence actually establishes the earlier state; current-vs-repository disagreement alone does not prove when or why drift occurred.
6. Map any required fix to its canonical owner. Maintained schema/endpoint mapping changes precede OpenAPI/generated-client regeneration. Runtime-only fixes stay with their application/package owner. Do not patch generated output directly.
7. Produce the [report contract](references/report-contract.md). Include current authoritative source URLs, retrieval time, relevant JSON pointers/sections, repository file/symbol evidence, executed/skipped checks, limitations, and a dependency-aware implementation order when changes are recommended.

## Verification

The service-free regression suite validates the comparator and audit instructions without claiming current upstream compatibility:

```bash
pnpm test:compatibility-audits
```

Repository policy separately verifies modeled-service ownership:

```bash
pnpm check:service-client-boundary
pnpm test:service-client-boundary
```

A fixture-only pass is never a live compatibility verdict.

## Safety and reporting

Never print or persist access/refresh tokens in reports, issues, or logs. Keep credential lifecycle with the CLI/OAuth client owner. If a live request fails, report authentication/service availability as a limitation rather than substituting stale evidence and calling the audit complete.

Report current facts with direct evidence. Distinguish observed behavior from inference. For endpoint links returned by `/data/doc`, preserve the distinction between the modeled request that produced the typed response and any application-owned resolution of the opaque returned data-plane URL.
