# iRacing MCP

`@iracing-data/mcp` defines **what** an iRacing Data API MCP server provides
and **which capabilities** it requires. It is listener-free,
credential-free, client-agnostic and provides three required tools:

- `get_my_driver`: current driver identity through tool-local `DriverQueries`.
- `get_recent_races`: a bounded recent-race window through `RecentRaceQueries`.
- `search_race_results`: explicit series or hosted/league participation search
  through `RaceSearchQueries`, for any supplied driver/team or search criteria.

An optional fourth tool, `find_reference`, resolves car, track, series and
car-class names/IDs through injected `ReferenceQueries`. It is advertised only
when `services.getReferenceQueries` is supplied; existing three-selector hosts
remain valid. The default runtime supplies this reference capability.

Tools register explicitly through the package-internal
[`registerApplicationTool`](src/execution.ts) adapter onto the MCP SDK.
Their input/output schemas, narrow service interfaces and domain operations
live beside each tool. Each execution callback visibly selects its request-local
capability; operations retain source validation, identity checks and bounds.
They return `Result` values, never MCP envelopes. There is no dynamic registry,
middleware pipeline, gateway, provider registry or DI container.

The adapter parses input once (including defaults and async refinements/transforms)
before dependency effects, generates one correlation context, normalizes expected
failures and exceptions, projects output, and builds equivalent structured/JSON-text
results. SDK-native invalid-input errors are text-only, so input parsing is
deliberately deferred to retain the fixed sanitized `INVALID_INPUT` envelope.
Invalid input carries at most eight bounded `{field, reason}` diagnostics derived
from input schema keys only. The SDK still owns protocol validation, dispatch and
final output validation.

Wire output schemas must be JSON-compatible object schemas without transforms.
Use source schemas or domain code for normalization; the adapter presents the
parsed output, never unprojected service data. Unrepresentable schemas fail during
registration. Expected failure descriptors preserve code-specific safe reasons;
retry delays require a retryable code or explicit `transient_refresh` reason.
Existing injected capabilities may still throw `ApplicationFailure`.

```ts
import { createIracingMcpServer } from "@iracing-data/mcp";

const server = createIracingMcpServer({
  serverInfo: { name: "consumer", version: "1.0.0" },
  services: {
    getDriverQueries: (context) => myDriverQueriesFor(context.authInfo),
    getRecentRaceQueries: (context) => myRecentRaceQueriesFor(context.authInfo),
    getRaceSearchQueries: (context) => myRaceSearchQueriesFor(context.authInfo),
  },
});
// Consumer owns connection, transport, session lifetime, and close().
```

Consumers with their own MCP server may instead call
`registerIracingTools(server, services)`. Neither API connects transport,
starts listeners, resolves credentials, or installs process handlers.

## Resource discovery and reference lookup

The server factory supplies initialization instructions covering tools versus
resources, permission declines, metadata boundaries and safe media discovery.
Instructions describe only host-selected resource namespaces and preserve
additional `serverOptions.instructions`. They never hydrate reference data.

Tool-catalog search cannot establish that a resource is absent. Clients should
list resources **and templates**, then read advertised concrete URIs. Use
`find_reference({ kind: "cars", query: "BMW", limit: 5 })` for bounded name lookup,
or read a known ID such as `iracing://series/120` directly.

`createCatalogReferenceQueries(catalogs, assetCatalogs)` adapts host-selected
resource resolvers to `ReferenceQueries`. Pass a selector for that instance as
`services.getReferenceQueries`; the adapter shares existing snapshot/index
access and never downloads media. Hosts can instead provide their own
request-scoped selector. No local credential fallback is introduced.

Lookups use exact numeric IDs or case-insensitive matching of all text keywords
against names and selected manufacturer/model/abbreviation fields. Track labels
include configuration names. Results are deterministic, default to 5 and cap at
20, with `total_matches`, `returned_count` and `has_more`; narrow the query when
needed. `available: false` means an unconfigured catalog, not a nonexistent
entity. Zero matches concern the selected snapshot only. Resource URIs are
included only for surfaces declared available by the injected provider.

**Interpretation limits:** a car's logo, sponsor logo or group image does not
establish a canonical manufacturer mark; clarify ambiguous branding requests.
Series metadata establishes identity and fields actually present, not a
guaranteed current season, eligible car list, schedule or recent activity.
Those require separate declared data sources. Never infer series nonexistence
from a race-results search with no matches.

## Reference resources

The package also owns the cars, tracks and car-class resource contracts:
`CarsCatalog`, `TracksCatalog`, and `CarClassesCatalog`. Each defines its URI
collection name, entity key, discovery metadata and canonical Data API schemas.
`createReferenceResource(definition, resolver)` combines the resource metadata with a
host-injected `CatalogResolver` (`all()` and `get(id)`).

Pass the resulting resources as `catalogs` to `createIracingMcpServer`, or call
`registerReferenceResources(server, catalogs)` on a consumer-owned server.
Collections use `iracing://cars`, `iracing://tracks`, and
`iracing://car-classes`; entity templates append the corresponding numeric ID.
Collection reads return JSON arrays directly; entity-template reads return
entity JSON objects directly. Neither includes a schema or a data wrapper.
Registration and discovery do not load
data. Omitting `catalogs` preserves tools-only hosting.

Collections are intended for bulk reference context; entity templates are preferred
when a tool result already supplies an ID. Templates support numeric ID-prefix
completion through `completion/complete`; this explicit data access may load the
host's collection, while resource and template listing remain lazy. The SDK bounds
completion responses to 100 suggestions and reports whether more matches exist.
Resource descriptors identify both user and assistant audiences.

Invalid IDs and missing entities return Invalid Params (`-32602`); missing entities
include the requested URI. Host loader failures return a sanitized Internal Error
(`-32603`), not upstream messages, credentials or local paths.
No change subscriptions or automatic freshness guarantees are provided.
Resources are application-driven context, not tools the model can assume it can
invoke. Clients choose whether to expose resource pickers, load entities from
tool-result IDs, or include bulk collections. See the
[MCP resource concepts](https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts#resources).

Transport selection does not change resource registration. The host owns
authorization, data loading, caching, persistence and refresh policy; the core
does not access the filesystem, instantiate generated clients, or acquire tokens.

The package never selects an HTTP implementation. Its tool-local
interfaces are implemented in the consuming application. The reference
host uses generated Fetch clients in its
[driver adapter](../../apps/iracing-data-mcp/src/adapters/driver.ts),
[recent-races adapter](../../apps/iracing-data-mcp/src/adapters/recent-races.ts),
[search adapter](../../apps/iracing-data-mcp/src/adapters/race-search.ts),
and [linked-response handler](../../apps/iracing-data-mcp/src/adapters/linked-response.ts).
A separate consumer can use generated Axios, mocks or another data source.
OAuth refresh and persistence belong only to the host. Signed HTTPS data links
are fetched by adapters without forwarded bearer credentials or redirects.

Tool outputs include equivalent structured content and JSON text
within a combined 64 KiB cap. Errors use fixed allowlisted messages,
codes, metadata and internally generated request IDs. An `INVALID_INPUT`
error may also carry a `details` array of at most eight `{field, reason}`
objects; `reason` comes from a closed allowlist and `field` is a dotted path
built from input schema keys. `unknown_field` is the one exception: it echoes
the caller's own unrecognized key, which by definition is not a schema key,
subject to the same identifier syntax and 64-character limit. Details never
include a rejected value, raw schema message, upstream text or a signed URL,
and they are rejected on any other error code. Tool calls are
read-only, require the host-selected authorization, and propagate cancellation.
Selectors receive optional internally generated `context.request` correlation
alongside the signal and host-verified identity. Domain operations receive only
the cancellation signal, not MCP correlation or identity context. Cancellation stops work and
propagates a fixed safe abort to the SDK, which suppresses cancelled responses;
it is not an upstream outage. No arbitrary abort reason is serialized.
`get_recent_races` returns up to ten upstream window entries (not complete
race history) and has **no cursor or retained collection state**.

Search retrieves one upstream chunk, without row slicing. Query-scoped counts
and `query_complete` distinguish one retrieved chunk from all matching results.
Calls do not retain cursor state or promise a stable snapshot across searches.
Supply an explicit season or UTC date scope; no participant or race-only filter
is assumed. Source-specific filters are validated before selecting services:
hosted accepts `track_id`, `car_id`, `session_name`, `host_cust_id`, `league_id`
and `league_season_id`; series accepts `season_year`, `season_quarter`,
`series_id`, `race_week_num`, `official_only` and `event_types`; `cust_id`,
`team_id`, `category_ids` and the start/finish ranges apply to both. Hosted
search additionally requires one of `cust_id`, `team_id`, `host_cust_id` or
`session_name`, as documented by the authenticated upstream notes. Rejected
combinations fail before the capability selector runs and report the offending
fields in `details`.
For both sources, `SearchInput` enforces a positive explicit start/finish window
of at most 90 days. When an end is omitted, its begin must be less than 90 days
old and not in the future. Older historical windows need explicit ends; multi-year
searches must be split into separate requests. Each range is checked independently
and a series season does not bypass invalid date filters. Season-only requests
remain supported. Validation uses the current clock for omitted ends and runs
before dependency selection; it never clamps dates or partitions requests.
For supported filters, example arguments and response-budget behavior, see the
[historical search contract](../../apps/iracing-data-mcp/README.md#historical-result-search).

Issue #533 supersedes the old restrictions in #473 and #382 only for
the unconnected server factory and narrow domain capability injection.
No generic transport/host lifecycle, credential management, or generated
API client dependency belongs in this package.

See the [reference host](../../apps/iracing-data-mcp/README.md) and the
[add-mcp-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md).

Static asset definitions and resource registration live in `src/resources/assets`.
Pass `assets: { catalogs, readMedia }` to `createIracingMcpServer`, or call
`registerAssetResources` on a consumer-owned server. The host supplies lazy
metadata resolvers and a credential-free media reader; this package does not
fetch or persist assets. Both runtime transports accept the same injected assets.
Asset templates support ID prefix completion and context-aware completion of
available image fields and map layers through the same host metadata resolvers.
Per-asset `/media` resources list safely resolvable image and map-layer MCP URIs
without downloading media.

`SeriesCatalog` extends the catalog set with series metadata. Optional
`documents` expose `ReferenceDocuments` categories, event types, divisions and
license definitions via `createReferenceDocumentResource`. No personal license
status or series eligibility is inferred from reference definitions.

`createReferenceResource`, `createReferenceDocumentResource` and
`createAssetResource` attach standalone schema resources under
`iracing://schemas/…`; registration never wraps schemas around returned data.
Schemas describe partial payload acceptance (unknown fields remain preserved),
not exhaustive upstream contracts. Only host-selected resources are advertised.

```sh
pnpm --filter '@iracing-data/mcp...' build
pnpm --filter @iracing-data/mcp test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
```

Core tests include compile-only inference fixtures via `test:types`. No live
iRacing credentials are required. OAuth interaction, caching, configurable
presenters and lifecycle middleware are separate changes, not adapter hooks.
