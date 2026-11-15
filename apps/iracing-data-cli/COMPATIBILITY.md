# CLI compatibility-maintenance pass

**Status: contract repairs verified; full live reconciliation incomplete.** The
contract-shape suite exercised **68 of 69** runtime Data API GET routes on
**2026-11-14**. One route remains **NOT_RUN** because no reviewed
`ta_comp_season_id` input was available, so this pass does not claim a full
**Compatible** verdict.

## All-route contract-shape pass (2026-11-14)

### Scope and authority

Maintenance on `feature/cli-refactor`, starting at `35ae096` with an already dirty
working tree. Existing OAuth, roster, contract, and refactor work was preserved.
The CLI is private tooling; the schema and generated Fetch/Axios/Rust clients are
public release candidates. No versions were bumped and nothing was published.

Current authenticated <https://members-ng.iracing.com/data/doc> was retrieved
through `iracing-data docs` on **2026-11-14 at 21:37 EST**
(2026-11-15T02:37Z). Its plain response was retained privately only for this run's
same-input structural comparison. The live batch ran from **22:00 to 22:01 EST**
(2026-11-15T03:00–03:01Z) through the existing CLI with an injected transport. No
separate modeled HTTP client was written. Returned cache URLs were stubbed out;
linked JSON/CSV/chunk payloads were never followed or validated.

### Coverage

- The current documentation map parses without schema errors.
- Structural comparison matches **74 documented endpoint entries and 139
  parameters**. Category-specific driver-stat entries share one path template,
  leaving **69 runtime GET routes**; the documentation map and generated
  contract matched **69 of 69** route templates.
- The comparator exits 2 for the same five known review candidates as the prior
  pass (two lookup-note selectors, three spectator-array serialization reviews).
  No documented endpoint is missing and no local-only runtime path remains.
- The live batch made **91 documented-route requests** plus **22 stubbed
  data-plane requests**, serially with a reviewed delay.
- Result: **68 PASS, 0 CONTRACT_MISMATCH, 0 BLOCKED, 1 NOT_RUN**.
- **NOT_RUN:** `/data/time_attack/member_season_results` requires a
  `ta_comp_season_id`; no reviewed valid competition season was available and the
  operator deferred this route. Under the suite contract this leaves the full
  reconciliation at **Unable to verify part of the contract**.

### Suite shape

`pnpm --filter @iracing-data/cli test:live:all --run` is the opt-in all-route
gate. Without `--run` it makes no requests and returns `NOT_RUN`.

- Expected routes, response schema bindings, required parameters, and CLI command
  paths are derived from `openapi/iracing.json`; there is no second endpoint
  table. Route response schemas are resolved from the OpenAPI `$ref` to the
  exported Zod schema `meta().id`.
- The runner drives the existing CLI in-process with an injected transport,
  captures the **raw wire JSON before decoder normalization**, and validates it
  with the endpoint's canonical Zod schema. It automatically supplies
  `--response-only` where the command supports it and otherwise stubs the
  returned cache URL, so only the immediate modeled response is examined.
- Reviewed inputs are supplied privately through `IRACING_LIVE_INPUTS` (JSON or a
  path). Missing required inputs and authentication/network failure are reported
  as `NOT_RUN`/`BLOCKED`, never as passes. Failures include field paths and codes
  but no received values, credentials, private identifiers, or signed URLs.
- `test/live-all-contract.test.cjs` covers the offline classification rules:
  contract binding for every generated route, sanitized rejection paths,
  unsuccessful-manifest detection, missing-input handling, auth preflight
  stopping the batch, and documentation coverage gaps. These tests prove suite
  behavior, not upstream compatibility.

### Confirmed repairs

The first full live batch reported two raw-response mismatches. Both were
empty-result variants that the canonical schemas rejected:

| Priority | Evidence                                                                                     | Repository mismatch and repair                                                                                                                                                                               | Owners                              |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| P1       | Live `/data/results/search_series` with a valid season/series filter that returned zero rows | Zero-chunk manifest returns `base_download_url: null`; the shared chunk schema required a URL. Made the field nullable; hosted search inherits the same chunk shape and therefore the same rule.             | `responses.ts`, `responses.test.ts` |
| P1       | Live `/data/stats/world_records` for a car/track with no records                             | Empty response returns `chunk_info: null` and echoes `season_year`/`season_quarter`; the schema required a chunk object and stripped the echoes. Made `chunk_info` nullable and the echoed seasons optional. | `responses.ts`, `responses.test.ts` |

After repair and regeneration, the same live batch passed both routes and the
remaining 66 executable routes. The two repairs are schema-only: the CLI commands,
request inputs, and adapter behavior are unchanged (**retain** decisions).

### Generation and validation

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api
pnpm --filter '@iracing-data/cli...' build
```

Affected generated surfaces are `openapi/iracing.{json,yaml}`,
`packages/api/client/{fetch,axios}`, and `crates/iracing-data-api-client`:
nullable chunk fields, echoed world-record season fields, a dedicated
world-record chunk-info model, indexes/docs, and generator bookkeeping. No
generated source was hand-edited. OAuth was not regenerated.

Authored schema tests pass (44), including empty/populated search-series and
world-record manifests and rejection of malformed/absent required fields. The CLI
suite includes the offline all-route contract classification tests. `pnpm verify`
remains service-free; the live gate is opt-in and does not run in CI.

### Limits

- This pass establishes the observed successful envelope for one reviewed valid
  request per route plus the two empty-result variants above. It does not prove
  schema completeness, every optional parameter's semantics or filter behavior,
  account-permission outcomes, error payloads, or linked JSON/CSV/chunk content.
- `/data/time_attack/member_season_results` remains unverified until a reviewed
  `ta_comp_season_id` is supplied. It must be reported as `NOT_RUN`, not as
  compatible coverage.
- A future full reconciliation reruns the same docs comparator and the live suite
  against fresh evidence, then records retain/revise/revert decisions in the
  [living log](../../docs/DATA-API-RECONCILIATION.md).

## Earlier scoped pass (2026-11-14)

This history is retained for the repairs that preceded the all-route suite.

### Scope and authority

Maintenance on `feature/cli-refactor`, starting at `35ae096` with an already dirty
working tree. Current authenticated
<https://members-ng.iracing.com/data/doc> was retrieved through `iracing-data
docs` on **2026-11-14 at 19:34 EST**. Live endpoint checks used the CLI and
generated Fetch client, not a separate modeled HTTP implementation. Returned
cache URLs were resolved without bearer credentials; response-only inspection
output was filtered to structural fields.

### Coverage

- The current documentation map parses without schema errors.
- Structural comparison matches **74 documented endpoint entries and 139
  parameters**. Category-specific driver-stat entries share a path template.
- **69 runtime Data API GET routes** have executable CLI coverage, checked
  automatically against the maintained OpenAPI document.
- `docs` retrieves the complete documentation map rather than duplicating each
  documentation route as a CLI leaf. Legacy `/auth` is not a Data API GET command;
  authentication uses the maintained OAuth client.
- New constants, lookup, member, season, series, statistics, result-detail,
  session, driver-stat, and time-attack commands received live CLI checks.
  Refactored car/series/track asset commands were also exercised live.
- Live checks establish the observed successful response variants, not every
  account-permission outcome, enum value, parameter combination, or error payload.
  The time-attack check returned an empty document for the selected historical
  competition; a populated result was not established.

### Confirmed repairs

These are current upstream/repository mismatches, not claims about when upstream
behavior changed.

| Priority | Evidence                                                                                             | Repository mismatch and repair                                                                                                                                                                 | Owners                                              |
| -------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| P1       | `/lookup/current_season`, `/session/reg_drivers_list` in current `/data/doc`, plus live CLI requests | Missing modeled endpoints. Added runtime/documentation operations and the required subsession parameter.                                                                                       | `parameters.ts`, OpenAPI helper                     |
| P1       | Live `/data/member/awards` and `/data/member/award_instances`                                        | Responses contain typed metadata and `data_url`, not `link/expires`. Added canonical response schemas, corrected mappings, and validate metadata before downloading.                           | `responses.ts`, OpenAPI helper, import-data service |
| P1       | Live `/data/stats/world_records`                                                                     | Response is a direct `stats_world_records` chunk manifest. Corrected its modeled response; CLI validates and preserves the wire manifest without expanding chunks.                             | `responses.ts`, OpenAPI helper, stats service       |
| P1       | `/stats/member_division/parameters/event_type`, live CLI validation                                  | Canonical input rejected CLI strings `"4"` and `"5"`. Reused the numeric-parameter primitive over the documented 4/5 domain. Requiredness and OpenAPI enum restrictions are regression-tested. | `primitives.ts`, `parameters.ts`, helper tests      |
| P2       | `/lookup/get/note`, plus live selector request                                                       | Generated operation could not send documented repeated weather/license-level selectors. Added canonical array parameters and CLI flags; tests verify repeated query keys.                      | `parameters.ts`, OpenAPI helper, lookup command     |
| P2       | Live `/data/driver_stats_by_category/sports_car` cache response                                      | Linked content is CSV. CLI now parses quoted CSV into JSON records using `csv-parse`; columns remain strings. Documented the payload format without changing the API envelope.                 | Activity service, OpenAPI operation description     |

Paths above are relative to `packages/api/schema/src/schema/` for schema files
and `packages/helpers/api-schema-to-openapi/src/index.ts` for the OpenAPI helper.
The existing league-roster repair was retained and included in the reviewed
public-document fingerprint.

### Reviewed comparator candidates

The comparator still exits 2 for review candidates; it is not a failing live
request or a clean zero-candidate audit:

- `lookup/get` selectors appear in the current endpoint's **note**, not its
  structured `parameters` map. The two “undocumented-local-parameter” candidates
  are supported by that current note and a successful live selector request.
- Three spectator-array candidates require semantic serialization review.
  Existing `style: form, explode: false` is correct for CSV filters; offline
  request assertions and live spectator commands verified it. No schema repair
  was needed for those arrays.
- No documented endpoint is missing and no local-only runtime path remains.

### Generation and validation (scoped pass)

Fetch was regenerated and built during endpoint development. After contract
review, all three Data API clients were regenerated from the same JSON contract:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api
pnpm --filter @iracing-data/api-client-fetch --filter @iracing-data/api-client-axios build
```

Affected generated surfaces are `openapi/iracing.{json,yaml}`,
`packages/api/client/{fetch,axios}`, and `crates/iracing-data-api-client`:
endpoint operations/documentation, response models, manifests/indexes, and
generator bookkeeping. No generated source was hand-edited. OAuth generation
was not requested by these CLI/Data API repairs.

The asset refactor removes scope factories in favor of injected command/service
capabilities and shared stdout display. Retired league-history tests and docs
were replaced: their previous local success depended on stale deleted-module
files in `dist/`. The CLI suite was rerun after moving the old build aside and
rebuilding from source.

Lint retained four exhaustive-dispatch complexity warnings; Rust retained
generated-code warnings. Neither was treated as proof of upstream compatibility.

`pnpm impact --base HEAD --json` also passed. It includes the pre-existing dirty
OAuth/tooling changes, so its broader release list is not authorization to
regenerate OAuth or publish packages. Temporary upstream documents were removed
after the same-input comparison.

Public return-type corrections need deliberate release review: schema first,
then regenerated SDKs and affected consumers. Award and world-record operations
do not advertise generic cache envelopes; lookup request parameters also change
its generated call surface. The all-route pass additionally makes
`baseDownloadUrl` and world-record `chunkInfo` nullable in generated clients.
