# Data API reconciliation log

Living decision memory for authored Data API contracts. Update whenever contracts
change; preserve dated history and add implementation commit references when
available. Do not commit solely to fill a reference. Follow the
[audit skill](../.agents/skills/iracing-data-api-compatibility-audit/SKILL.md)
and its [report contract](../.agents/skills/iracing-data-api-compatibility-audit/references/report-contract.md).

At each reconciliation, review applicable previous findings against **fresh**
official docs and live cases. Explicitly **retain / revise / revert** decisions,
or mark the review blocked. Corrected official definitions or changed method
behavior may invalidate a previous choice. Add a dated review rather than erasing
history. Historical entries are not current upstream authority. Never record
credentials, private identifiers, signed URLs, or raw response bodies.

## DATA-003 — Downloaded catalog and asset payload schemas

- **Decision:** add `*PayloadSchema` exports in
  `packages/api/schema/src/schema/payload.ts`, separate from modeled HTTP response
  envelopes. Retain all HTTP response mappings and generated client types.
- **Naming review (2026-11-16):** #553 uses `payload.ts`, `*PayloadSchema`
  schemas, `*Payload` inferred types and camel-case `*Payload` metadata IDs.
  These replace the initial `Json` names to avoid confusion with JSON Schema.
  Validation behavior and actual JSON Schema conversion APIs are unchanged.
- **Evidence collected:** authenticated official `/data/doc` retrieval at
  `2026-11-16T02:30:16Z` in the original MCP worktree, after operator
  reauthentication. Asset documentation states the static image base.
  Catalog payloads came from MCP-backed local snapshots (193 cars, 477 tracks,
  274 classes); fresh CLI/generated-client downloads contained 193 car,
  477 track and 162 series asset entries. These are dated observations, not
  proof of current upstream compatibility or complete field coverage.
- **Git context:** this schema-only split starts at
  `d1362d1fae8ce2b80184430cad070f62d8f00822`; its unchanged payload schema
  definitions were preserved in backup commit `4b261eb` on
  `backup/mcp-static-resources-2026-11-16`. Initial implementation: `9063fa2`;
  payload naming update: `5019a3e`. Local verification was intentionally skipped
  for the naming update; CI owns its verification.
- **Owners:** API schema package and its exports/tests/docs only. No MCP runtime
  implementation is included in this slice.
- **Acceptance:** catalogs are arrays; assets are ID-keyed JSON objects.
  Required identity/name fields, selected optional metadata, class ID zero,
  extensible nested membership and unknown properties are supported.
  Units are documented only where established; other fields remain unmodeled.
- **Public impact:** additive Zod exports and inferred types. Historical removed
  `Get*ResponseSchema` symbols stay removed; shared JSON payload ownership
  supersedes the old application-owned-payload recommendation. No version bump,
  tag or publication is authorized.
- **Command decision:** retain existing asset CLI commands. No input, operation
  or response-envelope change; no OpenAPI or client regeneration is required.
- **Validation:** schema tests (47), helper contract tests (7),
  `pnpm --filter '@iracing-data/api-schema-to-openapi...' build`, focused
  ESLint/Prettier and `git diff --check` passed for this split. Full branch
  verification remains a pre-merge gate. Original combined-tree verification
  passed; that is not automatically a pass for a reconstructed branch.
- **Next review:** recheck any modeled-field failures against fresh payloads.
  Passing acceptance does not detect additive drift or establish completeness.
  This work is **Unable to verify part of the contract**, not an all-route
  compatibility verdict.

### DATA-003 extension — Series and small reference resources (2026-11-17)

- **Context:** base `662c5da`, branch `restack/pr-556`; initially clean. This
  implementation extends #556 with series, reference definitions, media indexes
  and standalone schemas. Implementation commit: **pending**.
- **Current evidence:** authenticated official
  `https://members-ng.iracing.com/data/doc` retrieved at
  `2026-11-17T20:01:50Z`, then CLI/generated-Fetch materialization of
  `/data/series/get`, `/data/constants/categories`,
  `/data/constants/event_types`, `/data/constants/divisions` and
  `/data/lookup/licenses`. The default credential selection returned 401;
  explicitly selecting the operator-refreshed MCP credential document succeeded.
  No authentication implementation was changed.
- **Observed scope:** 162 series entries, 6 categories, 4 event types, 12
  divisions and 7 license groups. Constants have `label`/integer `value` rows;
  divisions include -1 (ALL) and zero-based division values. License groups have
  `license_group`, `group_name` and nested `levels`. These are dated observations,
  not a claim of complete upstream field coverage.
- **Structural comparison:** `node -r ts-node/register
scripts/audit-data-docs.cjs <private-docs-file>` accepted the documentation
  schema and matched all 74 documented endpoints. Exit 2 reported five existing
  lookup-selector/spectator-array review candidates outside this resource scope;
  none concerned the five resource endpoints above. No input or mapping repair.
- **Retain DATA-003:** keep downloaded payload acceptance separate from modeled
  link envelopes and preserve additive fields. Existing car, track, class and
  asset definitions are unchanged and were not re-audited in this extension.
- **Decision:** add partial `Series*PayloadSchema`,
  `ReferenceValue*PayloadSchema` and license-definition payload schemas in the
  shared API schema owner. Preserve raw series arrays, constants arrays and
  grouped license arrays in MCP reads. Publish schema documentation separately;
  media indexes are core-owned projections, not upstream payload contracts.
- **Command decision:** retain existing series/constants/lookup CLI commands.
  No modeled request/response, OpenAPI mapping or generated return-type changes;
  no regeneration needed. Additive public exports affect API schema and both MCP
  packages. No version bumps or publication authorized.
- **Validation:** `pnpm --filter '@iracing-data/iracing-data-mcp...' build` and
  `pnpm --filter @iracing-data/api-schema test` (48 tests) passed. The five freshly
  retrieved, materialized payloads passed their new acceptance schemas. Focused
  `node --test` execution of the core/runtime resource, asset, reference-document
  and asset-completion files passed 26 tests. Focused ESLint, Prettier and
  `git diff --check` passed. These regressions cover additive fields, negative
  sentinels, grouped license levels, lazy schemas, snapshot reuse, HTTP/stdio
  exposure and metadata-only media discovery. CI owns full offline verification
  for this extension; no generated files were regenerated.
- **Limitations:** no all-route live gate or exhaustive optional-field audit.
  Verdict: **Unable to verify part of the contract**, not all-route compatibility.
  Review again when payload acceptance fails or upstream documentation changes.
  Private temporary payloads are not retained as repository evidence.

## DATA-001 — Hosted search returns an inline manifest

- **Status:** repaired; scoped live case PASS. Not an all-endpoint verdict.
- **Observed:** 2026-11-15 UTC (2026-11-14 EST). Authenticated docs retrieved at
  2026-11-15T02:09:55Z; final scoped rerun completed before 2026-11-15T02:16:48Z.
- **Git context:** base `35ae096ec6737894b2da2f7df285e7a6926e0c06`,
  branch `feature/cli-refactor`, already dirty with substantial CLI/schema/SDK
  work. Implementation commit: **pending — uncommitted working-tree changes**.
- **Command decision:** **modify** `results-search-hosted`; preserve inline JSON,
  follow cache URLs only when `link` is present, never expand nested chunks.
- **Sources:** current official <https://members-ng.iracing.com/data/doc>,
  pointer `/results/search_hosted`, and read-only `/data/results/search_hosted`
  via the existing response-only CLI and generated Fetch transport, using the
  operator's bounded repro query.
- **Current fact:** successful response has type `search_hosted_results` with
  `data.success`, `data.chunk_info` and `data.params`, not `link`/`expires`.
  Chunk metadata has numeric `chunk_size`, `num_chunks`, `rows`, a
  `base_download_url` and `chunk_file_names`.
- **Repository mismatch (P1):** authored endpoint mapping selected
  `APIResponseSchema`; the first opt-in live case reported
  `CONTRACT_MISMATCH` at `link` and `expires`. The import service assumed a cache
  link and replaced failures with generic connectivity/token/scope advice.
- **Interpretation:** confirmed current repository contract/runtime mismatch,
  not proof of a historical upstream change or of an incorrect official published
  output schema: `/data/doc` does not fully define response payloads.
- **Repair/rationale:** add `ResultsSearchHostedResponseSchema` with the observed
  discriminator and compatible existing search chunk/params shape; bind the
  endpoint to it. Preserve raw JSON in CLI output so normalization cannot discard
  fields. Report safe failure stages instead of assuming authentication failure.
- **Canonical owners:** `packages/api/schema/src/schema/responses.ts`,
  `packages/helpers/api-schema-to-openapi/src/index.ts`,
  `apps/iracing-data-cli/src/commands/import-data/service.ts`.
- **Public impact:** generated Fetch/Axios/Rust hosted-search return types change
  from cache envelope to manifest: potentially breaking for consumers of the
  previously incorrect public output type. CLI is private. No version bumps,
  commits, releases or publication authorized.

### Validation and generation

The opt-in runner in `apps/iracing-data-cli/test/live/` resolves acceptance from
the maintained endpoint mapping and canonical schema exports. It runs one
docs/auth preflight and one search request serially, without retries or chunk
downloads. Normal verification remains offline.

- Before repair: **CONTRACT_MISMATCH**, `APIResponseSchema`, missing `link/expires`.
- First post-repair rerun: **BLOCKED**, HTTP 401 at preflight; no automatic login.
- After operator reauthentication: **PASS**, `ResultsSearchHostedResponseSchema`.
- Original default-mode repro (without `--response-only`): **PASS**, successful
  `search_hosted_results` manifest with one row. No chunks were expanded.
- Docs comparison: 74 matched entries / 139 parameters; comparator exit 2 for
  lookup-note and spectator-array review candidates, not hosted-search input
  mismatches. Those unrelated candidates were not repaired in this scope.
- Offline authored schema/CLI tests pass, including inline/default and
  response-only output, credential-free cache downloads, safe error stages,
  schema rejection and live-runner failure classification.
- Reviewed OpenAPI delta: removing only the new hosted response component,
  hosted schema component and changed 200 binding reproduces the prior reviewed
  document fingerprint. No unrelated contract delta was folded into that review.
- Regeneration preserved Fetch/Axios manifest versions and Cargo configuration.
- Five fresh read-only agent regression scenarios passed semantic review; see
  [the evaluation record](../agent-regressions/reports/hosted-reconciliation-2026-11-15.md).

Commands used from repository root (query supplied through
`IRACING_LIVE_HOSTED_QUERY`, credentials through normal CLI selection):

```bash
pnpm --filter '@iracing-data/cli...' --filter '@iracing-data/api-schema-to-openapi...' build
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
pnpm --filter @iracing-data/cli test:live --run
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api:fetch
pnpm --filter '@iracing-data/cli...' build
pnpm codegen:client:api:axios
pnpm codegen:client:api:rust
pnpm --filter @iracing-data/api-schema test
pnpm --filter @iracing-data/cli test
```

Generated destinations: `openapi/iracing.{json,yaml}`, Fetch/Axios source,
endpoint/model docs and generator bookkeeping under `packages/api/client/`,
and Rust source/model/docs/bookkeeping under `crates/iracing-data-api-client/`.
OAuth was not regenerated. Further checks are recorded below as they finish.

### Limits and next review

- This is one endpoint case, not the absent full live suite. It establishes
  acceptance of the observed successful manifest, not schema completeness,
  filter semantics, error/empty variants, or linked payloads. `params` remains
  the existing permissive echoed-parameter record.
- Re-fetch docs and rerun this case with reviewed bounded selectors. Inspect raw
  fields privately before changing requiredness or introducing unions.
- **Retain** if the method still returns the observed manifest. **Revise** for
  evidence-supported additional variants. Consider **revert** only if fresh
  official definitions and live behavior establish that the cache-envelope
  contract should replace this manifest contract; assess public migration and
  regenerate/retest all affected clients first.
- Preserve this history even when superseded; add date, git revision, evidence
  and rationale for the next retain/revise/revert decision.

## DATA-002 — Empty-result manifests omit chunk downloads and world-record chunks

- **Status:** repaired; all-route shape pass verified 68 of 69 runtime routes,
  with one route `NOT_RUN`. Not a complete upstream-equality claim.
- **Observed:** 2026-11-14 EST (2026-11-15 UTC). Current authenticated docs via
  `iracing-data docs` at 2026-11-14T21:37-05:00; all-route live batch from
  2026-11-14T22:00-05:00 to 22:01-05:00.
- **Git context:** branch `feature/cli-refactor`, working tree dirty from the CLI,
  schema and SDK work. Implementation commit: **pending — uncommitted
  working-tree changes**.
- **Command decision:** **retain** `results-search-series`, `results-search-hosted`
  and `stats-world-records`; this is a schema-only correction with unchanged CLI
  request behavior.
- **Sources:** current official <https://members-ng.iracing.com/data/doc> pointers
  `/results/search_series`, `/results/search_hosted`, `/stats/world_records`, and
  the existing CLI commands executed against the live API with reviewed inputs.
- **Current facts:**
  - A search-series manifest whose filters match zero rows has
    `data.success: true`, `data.chunk_info.num_chunks: 0`,
    `data.chunk_info.base_download_url: null`, and an empty chunk-file list.
  - An empty world-record response has `data.success: true`,
    `data.chunk_info: null`, echoes the supplied `season_year` and
    `season_quarter`, and includes `last_updated`.
- **Repository mismatch (P1):** the canonical chunk schema required a URL for
  `base_download_url`, so the zero-row search-series manifest was rejected. The
  world-record schema required a non-null chunk object and did not model the
  echoed season fields, so the empty response was both rejected and stripped.
  Hosted search inherits the same chunk shape through schema extension and
  therefore shared the first mismatch.
- **Interpretation:** confirmed repository contract gaps for documented
  empty-result variants. This does not establish that these fields were always
  nullable upstream or that the schemas are complete for populated variants.
- **Repair/rationale:** make `base_download_url` nullable on the shared search
  chunk schema; make world-record `chunk_info` nullable; add optional
  `season_year`/`season_quarter` echoes. Nullable content is modeled as data, not
  treated as an error envelope. Add acceptance/rejection tests for empty and
  populated manifests.
- **Canonical owners:** `packages/api/schema/src/schema/responses.ts`,
  `packages/api/schema/src/schema/responses.test.ts`.
- **Public impact:** generated Fetch/Axios/Rust clients now expose nullable
  chunk download bases and world-record chunk metadata, plus optional echoed
  season fields. This is a widening of accepted response types, not a request
  change. CLI remains private. No version bumps, commits, releases or publication
  authorized.

### Validation and generation

The opt-in all-route gate in `apps/iracing-data-cli/test/live/` derives runtime
GET routes and canonical response schemas from `openapi/iracing.json`, drives the
existing CLI through an injected transport, and validates the raw wire response
before decoder normalization. It stubs returned cache URLs and never downloads
linked JSON, CSV, or chunk payloads. Reviewed inputs are private to the run.

- Before repair, the live batch covered 69 of 69 documented routes and reported
  `CONTRACT_MISMATCH` for `/data/results/search_series` at
  `data.chunk_info.base_download_url` and for `/data/stats/world_records` at
  `data.chunk_info`.
- After repair, regeneration and rebuild: **68 PASS, 0 CONTRACT_MISMATCH,
  0 BLOCKED, 1 NOT_RUN** across the same 69 routes.
- `NOT_RUN`: `/data/time_attack/member_season_results` needs a reviewed
  `ta_comp_season_id`; none was available, and the operator deferred this route.
  The full reconciliation therefore remains **Unable to verify part of the
  contract**, not `Compatible`.
- Docs comparison against the same private response is unchanged: 74 matched
  documentation entries / 139 parameters / 74 matched endpoints, comparator
  exit 2 for the five previously reviewed lookup-note and spectator-array
  candidates, and no local-only path.
- Authored schema tests pass (44), including empty/populated search-series and
  world-record manifests and rejection of malformed or absent required fields.
  The CLI includes offline classification tests for the all-route runner.
- The runner made 91 documented-route requests and 22 stubbed data-plane
  requests with reviewed serial spacing; no retries and no automatic login.

Commands used from repository root:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api
pnpm --filter '@iracing-data/cli...' build
IRACING_LIVE_INPUTS=<private-inputs> IRACING_CREDENTIALS=.iracing-data/credentials.json \
  pnpm --filter @iracing-data/cli test:live:all --run
pnpm verify
```

Generated destinations: `openapi/iracing.{json,yaml}`, Fetch/Axios source,
endpoint/model docs and generator bookkeeping under `packages/api/client/`, and
Rust source/model/docs/bookkeeping under `crates/iracing-data-api-client/`. OAuth
was not regenerated. No generated source was hand-edited.

### Limits and next review

- The pass establishes one reviewed successful envelope per executable route and
  the two empty-result variants above. It does not prove completeness, exact
  upstream equality, every filter's semantics, permissions, error payloads, or
  any linked payload.
- The all-route suite depends on reviewed private inputs; missing IDs yield
  `NOT_RUN` and keep the overall verdict incomplete. Do not brute-force IDs or
  commit account data to turn a route green.
- **Retain** while live responses match these schemas. **Revise** for
  evidence-supported additional variants with acceptance tests. Consider
  **revert** only for contrary fresh evidence, assessing public migration and
  regenerating all affected clients first.
