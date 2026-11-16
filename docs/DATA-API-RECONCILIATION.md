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

## DATA-003 — Separate downloaded JSON schemas and self-describing MCP reads

- **Status:** additive payload contracts implemented; selected payload checks pass.
  **Unable to verify part of the contract:** no full raw-wire or all-route verdict.
- **Observed/reviewed:** 2026-11-16 UTC; authenticated docs retrieved at
  `2026-11-16T02:30:16Z`. Initial retrieval returned 401; the operator
  reauthenticated before the successful retrieval.
- **Git context:** base `2bc79cdc046f76b07fcdcfc9ffc976996c283502`,
  branch `feature/mcp-runtime-resource-resolver-proof`, already dirty with local
  MCP catalog/authentication work. Implementation commit: **pending**.
- **Sources:** current official `/data/doc` car/get, track/get, carclass/get,
  car/assets, track/assets and series/assets entries; official asset notes give
  `https://images-static.iracing.com/` as the image base. Docs establish routes
  and notes, not a complete schema of downloaded content. Fresh asset downloads
  used the existing CLI/generated Fetch client; catalog contents came through
  connected MCP reads and their existing local snapshots.
- **Finding/decision:** **retain** `APIResponseSchema` and all HTTP mappings.
  Downloaded JSON is distinct from link/expiry envelopes. Add explicit `*JsonSchema`
  exports in `packages/api/schema/src/schema/json.ts`, not `responses.ts`.
  Do not restore historical removed `Get*ResponseSchema` aliases. This revises
  the old application-owned-payload recommendation, not an upstream wire contract.
- **Acceptance:** required entity identity (plus catalog names); selected
  optional metadata with unknown properties retained. Class ID zero is valid.
  Asset documents are objects keyed by stringified IDs; catalogs are arrays.
  Undocumented units and empty-only rule-array item structures remain unmodeled.
- **MCP behavior:** resource JSON now contains `{ schema, data }`. Schemas derive
  from canonical Zod metadata, include self-contained local definitions, and
  distinguish entity and collection shapes. Snapshot files remain raw JSON.
- **Command decisions:** **retain** existing asset CLI commands; they already
  materialize downloaded data. No CLI query or endpoint mapping change needed.
- **Public impact:** additive API-schema exports; existing API envelopes and SDK
  return types unchanged. Experimental private MCP read format changes from
  bare data to `{ schema, data }`. No versions bumped or publication authorized.
- **Validation:** schema tests (47) and MCP tests (32), including actual stdio
  resource discovery, JSON Schema metadata and lazy process-lifetime caching.
  Canonical validation passed for 193 cars, 477 tracks and 274 car classes from
  MCP snapshots; fresh downloaded asset validation passed for 193 car, 477 track
  and 162 series asset entries. This proves selected acceptance, not full schema
  coverage, automatic drift detection or all-route compatibility.
- **Connected-agent limitation:** direct stdio reads returned `{ schema, data }`
  for all three collections and sampled entities. The project-scoped OpenCode
  management API advertises the new format after reconnect, but this session's
  built-in resource tools still returned the previous descriptions and bare
  payloads. Connected-agent uptake remains unverified; do not count direct stdio
  success as proof that this session has refreshed its connection.
- **Commands:** `pnpm --filter '@iracing-data/iracing-data-mcp...' build`;
  `pnpm --filter @iracing-data/api-schema test`;
  `pnpm --filter @iracing-data/iracing-data-mcp test`; `pnpm verify:js` (pass,
  two platform-specific CLI tests skipped); focused ESLint;
  docs via `node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js
--credentials .iracing-data/credentials.json docs`; asset downloads via the same
  CLI's `assets car`, `assets track`, `assets series`, parsed with canonical
  package exports. No raw bodies or signed links retained in this log.
- **Generation:** none required: no OpenAPI mapping, HTTP schema or generator
  input changed. No SDKs regenerated.
- **Limitations/next review:** catalog snapshots are not fresh-upstream evidence;
  asset payloads are current observations, not proof that all optional/non-null
  variants are covered. Review on modeled-field failures or new semantics.
  Full repository verification previously timed out during isolated generation.

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
