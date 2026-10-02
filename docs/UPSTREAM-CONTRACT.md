# Upstream contract evidence

`pnpm upstream:contract` captures upstream evidence without updating maintained schemas, OpenAPI, or clients. `pnpm test:upstream` runs offline regressions in `pnpm verify:repo` and full CI. Capturing evidence is separate from deciding whether repository behavior should change.

## Sources and normalization

OAuth capture fetches the official complete [print view](https://oauth.iracing.com/oauth2/book/print.html). Its `main` contains the book's chapters; review the current navigation and coverage when auditing, since the upstream publication format can change. HTML5 parsing decodes entities; normalization retains element structure, links, image descriptions, table spans, prose, and code. It excludes shell navigation, comments, scripts, styling attributes, and prose whitespace differences. Code whitespace and array order remain significant. This is deterministic structural evidence, not a semantic compatibility verdict: layout changes may still require interpretation.

Data capture fetches authenticated `https://members-ng.iracing.com/data/doc`. It requires a nonempty service/endpoint map with endpoint links. Keys are sorted recursively; arrays, types, nullability, parameter rules, descriptions, and unknown fields are retained. It does not coerce types or depend on maintained schemas to accept evidence. `/data/doc` alone does not establish every endpoint's response shape or runtime behavior.

Each snapshot has `formatVersion`, `kind`, normalized `content`, a SHA-256 `contentHash` over the exact UTF-8 pretty JSON content plus trailing newline, and `provenance` (fixed official source, UTC capture time, live/fixture mode, normalizer version). Provenance is excluded from comparison. Diff validates snapshot hashes/versions and emits sorted JSON Pointer paths with added/removed/changed values. Different normalizer versions require recapturing both inputs rather than comparing incompatible normalization. Never describe a fixture as a live capture or a changed hash as a required public API change.

## Manual capture

Install frozen dependencies first. Commands run from the repository root and write only new JSON basenames under ignored `.upstream-contract/`, with private permissions. Existing outputs are never overwritten. Raw bodies, headers, and credentials are never saved or logged. Network capture refuses redirects and times out after 30 seconds.

```bash
pnpm upstream:contract capture oauth oauth-current.json
# Supply IRACING_ACCESS_TOKEN through a trusted environment/secret manager.
pnpm upstream:contract capture data data-current.json
pnpm upstream:contract diff .upstream-contract/oauth-previous.json .upstream-contract/oauth-current.json oauth-diff.json
```

Diff exits 0 for equivalent content, 2 for drift, and 1 for failure. Capture/fixture exits 0 on success and 1 on failure. Failed capture is never an empty or unchanged baseline. Keep the previous artifact available and use unique output names.

For Data API capture, obtain an existing valid OAuth access token with `iracing.auth` scope using the approved registered client's documented [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html). The tool neither logs in nor refreshes tokens. Never put a token in CLI arguments, shell history, fixture files, issue bodies, or commits. In an interactive Bash session with shell tracing disabled, `read -rs IRACING_ACCESS_TOKEN; export IRACING_ACCESS_TOKEN` avoids including its value in history; unset it after capture. HTTP 401/403 requires checking token validity/scope/account access, not treating the response as documentation.

Known supplied token values, Bearer credentials, sensitive query values, and scalar credential fields are redacted before hashing/output. Protocol field names and nested parameter descriptions are retained. Redaction is defense in depth, not a general personal-data classifier: review artifacts before sharing. Do not pass login responses or unrelated account data as fixtures. Only normalized evidence is persisted; raw bytes are deliberately not retained.

## Without credentials / offline fixtures

```bash
pnpm upstream:contract fixture oauth scripts/fixtures/upstream-contract/oauth.html oauth-fixture.json
pnpm upstream:contract fixture data scripts/fixtures/upstream-contract/data.json data-fixture.json
pnpm test:upstream
```

These small synthetic fixtures validate tooling and are not official contract baselines. A maintainer may use a securely acquired `/data/doc` JSON file offline, but the output still records `fixture` mode because the tool did not authenticate that acquisition. Record acquisition provenance separately; never silently relabel it live. Lack of credentials leaves current Data API compatibility unverified.

## Automation

Run frozen installation and `pnpm test:upstream` without credentials on PRs. An opt-in trusted scheduled/manual workflow can run the same capture commands, download the previous reviewed artifact, diff, and upload only normalized snapshots/diffs using `actions/upload-artifact` with an explicit retention period. Handle exit 2 as reviewable drift; exit 1 is a capture failure and must fail the job. Store tokens in GitHub Actions secrets, limit job permissions to `contents: read`, disable shell tracing, and never expose secrets to fork or untrusted PR code. Public OAuth capture needs no secrets. Data capture needs a maintainer-controlled valid access token; do not assume a scheduled token remains valid or automatically perform a password grant.

Keep prior/current provenance with the artifacts for review, but do not compare capture times. No automated commits, schema rewrites, package publication, or releases are part of this workflow. A scheduled workflow is intentionally not enabled by this change. Consume evidence with compatibility audits and human-controlled implementation PRs.

## Compatibility audits

Use the repository's `iracing-data-api-compatibility-audit` skill for endpoint/parameter and Data API release-impact reviews, or `iracing-oauth-compatibility-audit` for authentication protocol reviews. Both validate deterministic evidence, rebuild inventory from canonical policy/current manifests and source, and remain read-only by default. Supply before/after snapshots when available; a capture request allows only ignored evidence writes. Findings must separate official facts, current mismatches, and interpretation, and identify authored ownership, downstream consumers, tests, breaking implications, and implementation/release order. Fixture-only runs must report upstream verification limits. A zero diff does not prove compatibility, and neither skill automatically updates public contracts or historical baselines.
