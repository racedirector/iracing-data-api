# Upstream compatibility boundaries

This repository does **not** maintain a generic upstream evidence runtime, canonical snapshot format, provenance/hash store, or persisted capture directory. Current compatibility work retrieves authoritative upstream information through the concrete owner for that surface and compares it to maintained repository sources.

Tracked fixtures remain valid only as deterministic test inputs. They are never evidence of the current iRacing service contract.

## Data API documentation

Modeled Data API calls belong behind generated clients produced from the maintained schema/OpenAPI pipeline. The repository CLI follows that boundary: `iracing-data docs` uses the generated Fetch client to retrieve the authenticated `/data/doc` response once and emits the plain documentation map.

For a current compatibility audit, build the CLI and schema/OpenAPI comparison dependencies, then feed that live response directly to the narrow structural comparator:

```bash
pnpm --filter '@iracing-data/cli...' --filter '@iracing-data/api-schema-to-openapi...' build
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
```

Use `--credentials <path>` on `docs` when the current audit should use a non-default ignored credential file. The comparator accepts `-` for stdin or a path to a plain JSON documentation response. If a temporary file is useful for one audit run, place it in a system temporary directory and remove it afterwards; do not treat it as durable upstream authority.

The comparator is intentionally narrow. It checks the current documentation map against the maintained documentation schema and OpenAPI endpoint/parameter representation. It does not fetch endpoint links, infer response payload contracts that `/data/doc` does not describe, or own transport, caching, credentials, persistence, hashing, provenance, or historical diff infrastructure.

See the [Data API compatibility-audit skill](../.agents/skills/iracing-data-api-compatibility-audit/SKILL.md) for the semantic review and reporting procedure.

## OAuth compatibility

OAuth compatibility audits start from the current official iRacing OAuth documentation and follow its current navigation during the audit. The [OAuth compatibility-audit skill](../.agents/skills/iracing-oauth-compatibility-audit/SKILL.md) owns that workflow. Persisted normalized OAuth-book captures are not current authority.

Modeled OAuth runtime calls remain behind the maintained schema/OpenAPI/generated-client path. Public documentation URLs used by the compatibility skill are documentation evidence, not an application transport bypass.

## Returned opaque Data API links

Generated-client ownership of modeled service calls is distinct from opaque URLs returned in typed Data API responses. Applications may own safe resolution of those returned data-plane URLs, including host/path validation, expiry/TTL handling, caching, request coalescing, retention, and deciding whether to return or materialize a still-valid link.

The repository verification guardrail in [`check-service-client-boundary.mjs`](../scripts/check-service-client-boundary.mjs) enforces this distinction: statically authored modeled service endpoints and root-script transport bypasses are rejected, while dynamic resolution of an opaque returned URL remains valid application behavior.

## Offline verification

Normal `pnpm verify` remains service-free. Compatibility-audit tests validate the comparison and guidance mechanics without claiming live upstream compatibility:

```bash
pnpm test:compatibility-audits
pnpm check:service-client-boundary
pnpm test:service-client-boundary
```

A passing fixture or policy test establishes repository behavior only. A current upstream compatibility claim requires current authoritative upstream retrieval during that audit run.
