# CLI compatibility-maintenance pass

**Status: Compatible within the reviewed scope below.** This is a maintenance
result, not an exhaustive guarantee for every upstream payload or permission.

## Scope and authority

Maintenance on `feature/cli-refactor`, starting at `35ae096` with an already dirty
working tree. Existing OAuth, roster, contract, and refactor work was preserved.
The CLI is private tooling; the schema and generated Fetch/Axios/Rust clients are
public release candidates. No versions were bumped and nothing was published.

Current authenticated <https://members-ng.iracing.com/data/doc> was retrieved
through `iracing-data docs` on **2026-11-14 at 19:34 EST**. Its plain response was
retained privately only for this run's before/after structural comparison.
Live endpoint checks used the CLI and generated Fetch client, not a separate
modeled HTTP implementation. Returned cache URLs were resolved without bearer
credentials; response-only inspection output was filtered to structural fields.

## Coverage

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

## Confirmed repairs

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

## Reviewed comparator candidates

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

## Generation and validation

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

Final `pnpm verify` passed: topology and modeled-service ownership checks,
authored lint/format, workspace/example builds and tests, generated freshness
and wire contracts, and Rust format/check/clippy/tests. The CLI suite passed
**284 tests**, with **two Linux-only browser-handoff skips on macOS**; this
includes the 69-route OpenAPI dispatch check. Schema tests passed (42), and the
OpenAPI-helper tests passed (6), including the reviewed contract fingerprint.
Lint retained four exhaustive-dispatch complexity warnings; Rust retained
generated-code warnings. Neither was treated as proof of upstream compatibility.

`pnpm impact --base HEAD --json` also passed. It includes the pre-existing dirty
OAuth/tooling changes, so its broader release list is not authorization to
regenerate OAuth or publish packages. The temporary upstream document was removed
after the same-input comparison.

Public return-type corrections need deliberate release review: schema first,
then regenerated SDKs and affected consumers. In particular, award and
world-record operations no longer advertise generic cache envelopes. Adding
lookup request parameters also changes its generated call surface.
