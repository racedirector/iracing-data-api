# Capture once, audit offline

Use this procedure for a current authenticated Data API audit. Read root and scoped guidance first. Use current CLI manifests/help and [CLI documentation](../../../../apps/iracing-data-cli/README.md) if options change. The CLI is private repository tooling; do not infer a published installation path.

## Authentication and one capture

Build the CLI and the authored schema/generator dependencies:

```bash
pnpm --filter '@iracing-data/cli...' build
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
```

Resolve credentials without displaying values: explicit `--credentials <path>` wins, then `IRACING_ACCESS_TOKEN` from the shell/root `.env`, then the repository's ignored `.iracing-data/credentials.json`. If the user populated the first-call example's `.env`, load that file when invoking the CLI:

```bash
node --env-file-if-exists=.env --env-file-if-exists=examples/data-api-first-call/.env apps/iracing-data-cli/dist/index.js docs --snapshot --output .upstream-contract/data-current.json
```

Check existing credentials with `pnpm run iracing-data whoami` (use the same `--credentials` override planned for capture). This checks the official OAuth profile rather than consuming a docs request. Profile needs `iracing.profile`; old auth-only tokens can still be tried directly for docs. Network failures are not proof that login is required. Login requests both `iracing.auth` and `iracing.profile`.

For the normal repository credential handoff:

```bash
pnpm run iracing-data auth login
pnpm run iracing-data whoami
pnpm run iracing-data docs --snapshot --output .upstream-contract/data-current.json
# Override credentials when needed:
pnpm run iracing-data docs --credentials .upstream-contract/credentials.json --snapshot --output .upstream-contract/data-other.json
```

`auth login` updates `.iracing-data/credentials.json` by default; `--credentials` selects another file to update. Browser authorization can require the user's interaction. Use existing credentials first; do not start repeated logins or refresh automatically. A live capture request authorizes ignored evidence writes and this credential handoff when needed, but does not authorize tracked contract changes. A failed or expired token is an authentication limitation, not an empty docs baseline. HTTP 401/403 requires checking expiry, scope and account access, then obtaining a new token if needed.

Choose unique evidence basenames instead of replacing prior snapshots. Use JSON with `--snapshot` for the audit; ordinary `docs --output ...` emits the complete normalized docs map, like the first-call example's documentation request, without the snapshot envelope. Snapshot output records live provenance using the existing fixed-source capture/normalizer, hash and redaction implementation. It fetches `/data/doc` once, refuses redirects, and times out after 30 seconds. Do not fetch endpoint links to retrieve the docs. Do not rerun the first-call example after capture: reuse the same evidence throughout the audit. Verify evidence and credential paths are ignored before writing; never print credentials, raw error bodies or tokens.

## Deterministic comparison

```bash
node -r ts-node/register scripts/audit-data-docs.cjs .upstream-contract/data-current.json
pnpm test:upstream
```

The comparison makes no network requests and writes no files. It validates the snapshot, parses its content with current `ServicesDocsResponseSchema`, and uses the authored generator source plus current built schema dependencies to compare paths, query parameter names, requiredness and type families. It reports endpoint/parameter coverage, JSON Pointer evidence, unmatched/local-only paths, documentation parsing failures, and array serialization review candidates. Exit 0 means no structural candidates, 2 means reviewable discrepancies, and 1 means the audit failed. A fixture remains fixture evidence; zero candidates never establishes full compatibility.

Optional report redirection belongs under ignored `.upstream-contract/`; use a private umask and a fresh path. The helper deliberately does not derive correctness from committed OpenAPI or client types. Build dependencies first to avoid stale workspace imports. Do not run codegen for an audit.

## Semantic review remains necessary

Follow every candidate to the authored schema/mapping and actual consumers. Inspect all covered parameters' enums/ranges and prose rules even when types match. A numeric type comparison cannot detect a calendar year constrained to quarter literals. Resolve path templates and schema references before calling a route or type missing. Upstream `numbers` often means comma-separated numbers; CSV string schemas can be correct, while array schemas require checking OpenAPI style/explode and actual client encoding. Conditional requiredness in notes is distinct from the `required` flag.

Check optional/missing documentation fields and unknown-field stripping separately: successful parsing can still discard endpoint notes. Docs parsing failures do not prove the generated Fetch client rejects the same wire document; inspect the boundary. Local-only paths are unverified capabilities, not proof of upstream removal. `/data/doc` does not establish full endpoint response schemas, live endpoint success or errors; label these gaps rather than request arbitrary endpoints during this one-capture audit.

Produce the [report contract](report-contract.md). Use the captured official URL/hash/pointer and current file/symbol for findings. State current mismatches without claiming historical drift. For verification-only requests, leave fixes and regeneration as recommendations. Otherwise continue through the repair and regeneration phase in the skill. Version decisions and publication remain separate.

## Repair and regenerate

For compatibility maintenance, fix confirmed mismatches in authored schemas/mappings and add deterministic regression tests. Use evidence-backed changes rather than turning every structural candidate into a patch. Unsupported new endpoints, uncertain response shapes and ambiguous requirements need further evidence; leave them explicit if they cannot be resolved within scope. Preserve public operation IDs where the wire path alone is wrong. Characterize existing behavior before behavior-changing refactors.

After shared Data API contract changes, build the generator, generate both formats, then all three SDKs:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api
```

Follow current [OpenAPI guidance](../../../../openapi/AGENTS.md) and downstream scoped guides for consumer builds, tests, freshness and Rust checks. Runtime-only fixes and generator-specific fixes stay at their authored owner with the scoped generation path. Do not regenerate OAuth solely because CLI authentication was used. Inspect generated diffs and preserve authored manifest versions/settings. Re-run the offline comparison using the SAME snapshot; describe before/after findings and unresolved limitations. Run applicable lint/style/tests and `pnpm verify`; report actual failures and unavailable toolchains. Use impact tooling for independent release candidates, but do not bump/tag/publish automatically. Rollback means reverting the authored fixes and regenerating the affected branch.
