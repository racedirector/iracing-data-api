# Live Data API compatibility workflow

Use this procedure for a current authenticated Data API audit. Read root/scoped guidance and the current CLI help/documentation first. The CLI is private repository tooling; do not infer a published installation path.

## Build the concrete owners

Build the CLI and authored schema/generator dependencies from the repository root:

```bash
pnpm --filter '@iracing-data/cli...' --filter '@iracing-data/api-schema-to-openapi...' build
```

Use the repository Node/pnpm versions and frozen dependencies. This does not require write-mode code generation.

## Retrieve current documentation

Resolve credentials without displaying values. Explicit `--credentials <path>` wins, then `IRACING_ACCESS_TOKEN` from the shell/root `.env`, then the repository's ignored `.iracing-data/credentials.json`. `iracing-data docs` uses the generated Fetch `DocApi`; it owns the modeled `/data/doc` request and does not fetch endpoint links returned by that response.

For verification-only work that does not need to inspect the raw document separately, stream the current documentation directly into the comparator:

```bash
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
```

Use `--credentials <path>` on `docs` when another ignored credential file is required. A selected invalid credential file must fail rather than silently falling back. Network failure is not proof that login is required; HTTP 401/403 requires checking expiry, scope, and account access before obtaining a new token.

For compatibility maintenance, or when semantic review needs the plain current response, keep one private temporary copy for the duration of the run:

```bash
tmp_dir="$(mktemp -d)"
chmod 700 "$tmp_dir"
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs --output "$tmp_dir/data-docs.json"
node -r ts-node/register scripts/audit-data-docs.cjs "$tmp_dir/data-docs.json"
```

That file is an ephemeral input for the current run, not current authority for a later audit. Do not create a repository capture directory, durable normalized evidence format, hash history, or generic diff store. Retrieve authoritative documentation again on a later audit. Never print credentials, raw token values, or token-bearing errors.

If current authenticated documentation cannot be retrieved, stop the current-contract claim and report **Unable to verify part of the contract** for the unavailable surface. Fixtures and earlier audit output may explain/test mechanics but cannot replace live authority.

## Deterministic structural comparison

```bash
pnpm test:compatibility-audits
pnpm check:service-client-boundary
pnpm test:service-client-boundary
```

[`audit-data-docs.cjs`](../../../../scripts/audit-data-docs.cjs) performs no network access and writes no files. It compares the plain current documentation map with maintained schema/OpenAPI ownership, reports route/reference/parameter candidates, and exits 0 for structural agreement, 2 for reviewable discrepancies/schema rejection, or 1 for execution failure. These service-free tests establish repository mechanics only; they do not establish current live compatibility.

## Semantic review remains necessary

Follow every candidate to the authored schema/mapping and actual consumers. Inspect all covered parameters' enums/ranges and prose rules even when types match. A numeric type comparison cannot detect a calendar year constrained to quarter literals. Resolve path templates and schema references before calling a route or type missing. Upstream `numbers` often means comma-separated numbers; CSV string schemas can be correct, while array schemas require checking OpenAPI style/explode and actual client encoding. Conditional requiredness in notes is distinct from the `required` flag.

Check optional/missing documentation fields and unknown-field stripping separately: successful parsing can still discard endpoint notes. Documentation parsing failures do not prove the generated Fetch client rejects the same wire document; inspect the boundary. Local-only paths are unverified capabilities, not proof of upstream removal. `/data/doc` does not establish full endpoint response schemas, live endpoint success, or errors; label these gaps rather than requesting arbitrary endpoints during the documentation audit.

Application resolution of opaque signed/cache/chunk URLs returned by a typed Data API response is not a modeled-service bypass. Review that behavior under the application owner's host/path validation, expiry, caching, coalescing, retention, and materialization policy.

Produce the [report contract](report-contract.md). Use the current official source URL, retrieval time, relevant JSON pointer/section, and current repository file/symbol for findings. State current mismatches without claiming historical drift. For verification-only requests, leave fixes and regeneration as recommendations. For requested compatibility maintenance, continue through the repair phase below.

## Repair and regenerate

For compatibility maintenance, fix supported mismatches in authored schemas/mappings and add deterministic regression tests. Do not turn every structural candidate into a patch. Unsupported new endpoints, uncertain response shapes, and ambiguous requirements need further current authoritative evidence; leave them explicit when they cannot be resolved within scope. Preserve public operation IDs where only the wire path is wrong. Characterize existing behavior before behavior-changing refactors.

After shared Data API contract changes, build the generator, generate both OpenAPI formats, then regenerate the Data API clients through the existing ownership path:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api
```

Follow current [OpenAPI guidance](../../../../openapi/AGENTS.md) and downstream scoped guides for consumer builds, tests, freshness, and Rust checks. Runtime-only fixes and generator-specific fixes stay at their authored owner with the scoped generation path. Do not regenerate OAuth solely because CLI authentication was used. Inspect generated diffs and preserve authored manifest versions/settings.

When a private temporary Data API documentation file was created for this run, rerun the comparator against that **same current response** after repository repairs so the before/after result isolates repository changes. Then run applicable lint/style/tests and `pnpm verify`; report actual failures and unavailable toolchains. Use impact tooling for independent release candidates, but do not bump/tag/publish automatically. Remove the temporary documentation file/directory at the end of the run.
