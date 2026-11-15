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

The living [Data API reconciliation log](DATA-API-RECONCILIATION.md) records dated
findings, git context, contract decisions and their later reviews. Update it
whenever contracts change. It is historical decision memory, not current upstream
authority or a raw-response archive; subsequent reconciliations must revalidate
applicable decisions and explicitly retain, revise or revert them.

## Live authored input/output contracts

Reconciliation proceeds from current docs and structural diff to reviewed live
cases. Validate canonical request inputs and raw modeled response outputs through
the existing CLI/generated client; do not test generated class/decoder internals.
Canonical schemas and endpoint mappings own acceptance. An envelope parse does
not validate a linked JSON/CSV/chunk payload, and a permissive Zod parse does not
prove complete upstream equality or every optional parameter's behavior.

The CLI's current full-endpoint test uses mocked transport. There is no executable
all-endpoint live contract suite yet, and response-only support is not universal.
Do not treat either gap as passing coverage or put authenticated tests into normal
`pnpm verify`. The package-local
[API command skill](../apps/iracing-data-cli/.agents/skills/api-command/SKILL.md)
owns command work; its
[live validation boundary](../apps/iracing-data-cli/.agents/skills/api-command/references/live-contract-validation.md)
defines the minimal opt-in gate and explicit blocking outcomes.

Every changed contract case must trace to an add/modify/retain/retire command
decision. A schema-only repair can retain the command with a reason; test-only
changes must not conceal lost endpoint coverage. Auth/access/service failures are
not schema drift. A requested full reconciliation with a missing live gate must
report that part of the contract as unverified.

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
