# iRacing Data MCP runtime

Four read-only tools in the default serve command: `get_my_driver`,
`get_recent_races`, `search_race_results`, and `find_reference`. The
`@iracing-data/mcp` package owns the listener-free MCP server and contracts.
This app supplies an optional Hono adapter, an optional Node listener, and a
local stdio executable. It does not implement an OAuth server, JWT verifier,
Docker credential importer, or session registry.

## Local stdio (default)

After publication, install the runtime with
`npm install -g @iracing-data/iracing-data-mcp@next` and configure clients to
execute `iracing-data-mcp serve`. The first release is not available until the stack
has landed and release smoke tests pass.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/iracing-data-mcp...' build
# Copy only if .env does not already exist, then configure its values.
cp .env.example .env
pnpm iracing-data auth login --scope iracing.auth
pnpm exec dotenv -e .env -- iracing-data-mcp serve
```

The local executable loads a file-backed OAuth session, defaulting to
`.iracing-data/iracing-data-mcp/credentials.json`. Override its location
using `IRACING_CREDENTIALS`. The setup above uses the CLI for initial
credential acquisition; loading the selected file is independent of the CLI.
`IRACING_MCP_CREDENTIAL_FILE` is retired. Rename it to `IRACING_CREDENTIALS`;
startup rejects the old setting rather than silently selecting another document.
The runtime refreshes expired access tokens on demand and saves rotated
credentials to the same file. Set `IRACING_AUTH_CLIENT` and, for confidential
clients, `IRACING_AUTH_SECRET` to the registration used for CLI login.
If renewal fails, sign in again through the CLI. Do not start two
credential owners against the same rotating refresh token.

For an explicit path in a client command, pass `--credentials`:

```sh
iracing-data-mcp serve --credentials /absolute/path/to/credentials.json
```

Selection order is `--credentials`, then `IRACING_CREDENTIALS`, then
the dedicated MCP default. Relative paths resolve from the process working
directory. There is no fallback to another credential file. Restart the
MCP process after selecting a different path or replacing the document.
The retained session store loads once; it does not watch or reload the file.
The OAuth client coordinates concurrent refreshes within the local connection
and refreshes expired
access tokens during restoration; it does not use an early-refresh window.

The serve command validates its options before opening a transport. Credential
documents are read on demand through the OAuth client's secure document store;
starting the transport does not prove the credentials are present or usable.
The provider propagates OAuth/storage failures to its caller without logging
or custom error translation. The host owns diagnostics; tool adapters still
apply the existing safe MCP error projection.

The stdio process writes MCP protocol messages only to stdout. It does not
listen on a port or start a browser login. Configure your MCP client to run
`iracing-data-mcp serve` after installing. In this workspace, use
`pnpm exec dotenv -e .env -- iracing-data-mcp serve` with the project root as its working
directory after building.

## Development watch mode

After building workspace dependencies with the command above, run:

```sh
pnpm --filter @iracing-data/iracing-data-mcp dev
# Or use the loopback-only HTTP listener:
pnpm --filter @iracing-data/iracing-data-mcp dev --transport http
```

The command builds the app, starts `serve`, and rebuilds/restarts when `src/`,
`tsconfig.build.json`, or `package.json` changes. It keeps watching after build
errors; fix the error and save again. Generated `dist/` changes do not trigger
restart loops. Workspace dependencies are not watched. Stop with Ctrl+C.
The development launcher loads the repository root `.env` when present without
overriding inherited environment variables, and runs the app from the repository
root so relative credential paths match the workspace command above. The published executable
still does not load `.env`. Restart the command after changing `.env`.
Stdio clients must reconnect after a restart; HTTP is convenient for manual
development.

Run `pnpm mcp:inspect:stdio` or `pnpm mcp:inspect:http` from the repository
root to use Inspector. Both modes launch from that root, preserving relative
`IRACING_CREDENTIALS` paths and the dedicated MCP credential default.

## Environment configuration

The executable **only consumes its supplied environment**. It never loads `.env`
or accepts env-file flags. Use the MCP client's environment configuration, your
deployment platform, or an external loader. The workspace command uses the development-only
[dotenv CLI](https://github.com/entropitor/dotenv-cli):

```sh
pnpm exec dotenv -e .env -- iracing-data-mcp serve
```

Copy [the repository `.env.example`](../../.env.example) without overwriting an
existing `.env`, then configure it. It lists every supported MCP environment
option and the separate CLI-only login/API options. Dotenv CLI preserves existing
process environment values by default. Missing values are validated by the MCP,
not filled from hidden credential or registration fallbacks.

| Variable               | Usage                              | Requirement / default                                                                                                               |
| ---------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `IRACING_AUTH_CLIENT`  | Local stdio OAuth registration     | Required, nonblank; must match the original login                                                                                   |
| `IRACING_AUTH_SECRET`  | Local stdio OAuth client secret    | Required for confidential registrations; omit or leave empty for public clients                                                     |
| `IRACING_CREDENTIALS`  | Selected local OAuth JSON document | Defaults to `.iracing-data/iracing-data-mcp/credentials.json` under the process working directory; `--credentials` takes precedence |
| `IRACING_ACCESS_TOKEN` | Explicit access token              | Optional; bypasses file-backed OAuth restoration and registration requirements                                                      |

Use `iracing-data-mcp serve --help` for supported flags. `--transport` defaults
to `stdio`; `--transport http` uses `127.0.0.1:3000`. The CLI does not currently
expose listener host or port options. The runtime cannot infer whether a
registration is confidential or prove registration/session compatibility offline;
supply the correct secret when issued.

For initial login use `pnpm iracing-data auth login --scope iracing.auth`.
Credential files must satisfy the OAuth document reader's checks (on POSIX:
current-user-owned directory mode `0700` and file mode `0600`, no symlinks).
See [CLI login setup](../iracing-data-cli/README.md#build-and-run-locally) for acquisition.
After fixing configuration or replacing a credential document, restart the
MCP process to create a fresh credential owner.

## Finding reference metadata and assets

Initialization instructions distinguish tool search from resource discovery.
List this server's resources and templates before declaring reference metadata
or media unavailable. Use resource-read support to follow advertised URIs;
missing tool-search hits do not justify repository/CLI/manual-HTTP fallback.
A declined call is a permission decision, not an API/authentication failure.

`find_reference({ kind: "cars", query: "BMW", limit: 5 })` searches a single
host-selected catalog by exact numeric ID or case-insensitive name/manufacturer/
model keywords. Other kinds are `tracks`, `series` and `car-classes`. It returns
bounded candidate IDs/display names with available metadata, asset and media-index
URIs. Track labels include layouts. It shares lazy snapshots with resource reads
and never downloads media. The default limit is 5, maximum 20; use `has_more`
and `total_matches` to decide whether to narrow the query. Matching is not fuzzy.
An unavailable catalog is reported as `available: false`, distinct from zero
matches in a configured snapshot.

For a known series ID, read `iracing://series/120` directly. Series identity,
category and restrictions are not automatically its current-season cars,
schedule or recent activity. Use separate declared capabilities for those facts;
do not infer identity or nonexistence from race results. Historical queries still
require an explicit season or UTC date range.

For a logo request, resolve candidate cars, inspect the selected car's media
index, then read an advertised image URI. A BMW car's `logo`, `sponsor_logo` or
`group_image` is not necessarily the BMW manufacturer's mark. If the intended
car/branding variant is ambiguous, present candidates or ask for clarification.

Embedding hosts opt into this fourth tool through `getReferenceQueries`.
`createMcpServices(source, createCatalogReferenceQueries(catalogs, assetCatalogs))`
provides one host/credential-owner-bound reference selector; hosts needing
request-local selection can supply `getReferenceQueries(context)` directly.
Hosts without this optional selector retain the three required tools.
Additional host server instructions are preserved by the core factory.

## Static catalog resources

Local stdio and HTTP advertise these collections and entity templates:

| Collection              | Entity template                        | Snapshot           |
| ----------------------- | -------------------------------------- | ------------------ |
| `iracing://cars`        | `iracing://cars/{car_id}`              | `cars.json`        |
| `iracing://tracks`      | `iracing://tracks/{track_id}`          | `tracks.json`      |
| `iracing://car-classes` | `iracing://car-classes/{car_class_id}` | `car-classes.json` |
| `iracing://series`      | `iracing://series/{series_id}`         | `series.json`      |

Collection reads return the JSON array directly; entity-template reads return
the entity JSON object directly. Neither includes a schema or a data wrapper.
Payloads are validated using `@iracing-data/api-schema`. Unknown fields are
retained, not claimed as completely modeled. Class ID zero is valid upstream.
Use a race result's car_id, track_id or series_id to resolve the corresponding
entity. Series metadata retains upstream eligibility and allowed-license fields;
series branding is separately available at `iracing://assets/series/{id}`.

Catalog construction and discovery never read snapshots, restore OAuth sessions
or fetch. First catalog use loads
and validates `<credentials-directory>/reference/<snapshot>`. Only a missing file
fetches upstream, through the same serialized OAuth resolver as tools. Validated
data is atomically saved as raw JSON. Concurrent reads share hydration; subsequent
requests reuse parsed data and its ID index for the local process lifetime.
Failed hydration is retryable; invalid data and duplicate IDs are rejected.

There is no cache warming, automatic expiry or refresh tool in this slice.
To refetch, stop the server, remove the chosen snapshot, and restart.
These static snapshots are not suitable
for changing result searches or member statistics.

`@iracing-data/mcp` owns catalog definitions, validation schemas and resource
registration. `src/catalog.ts` owns lazy indexing, `src/snapshots.ts` owns
atomic persistence, and `src/adapters/catalog.ts` owns concrete SDK selection.

### Reference definitions

These small collections return raw upstream JSON arrays and use the same lazy
snapshot lifecycle:

| Resource                | Snapshot           | Contents                                                  |
| ----------------------- | ------------------ | --------------------------------------------------------- |
| `iracing://categories`  | `categories.json`  | Category labels and numeric values                        |
| `iracing://event-types` | `event-types.json` | Event-type labels and numeric values                      |
| `iracing://divisions`   | `divisions.json`   | Division labels and values, including `-1` for ALL        |
| `iracing://licenses`    | `licenses.json`    | License groups and their nested license-level definitions |

Constants are direct API arrays; license definitions are materialized from the
returned signed link. Definitions are not a member's license status and do not
guarantee eligibility. No enum meanings or safety-rating unit conversions are
invented. Embedding hosts inject optional `documents` created with
`createReferenceDocumentResource`; the runtime's `createReferenceDocuments`
adapter supplies file snapshots and concrete SDK access.

### Standalone schemas

Selected catalogs, documents and assets advertise separate JSON Schema resources:

- `iracing://schemas/{catalog}` and `iracing://schemas/{catalog}/entity`, for
  `cars`, `tracks`, `car-classes` and `series`.
- `iracing://schemas/{document}`, for `categories`, `event-types`, `divisions`
  and `licenses`.
- `iracing://schemas/assets/{kind}`, `/entity` and `/media`, for `cars`, `tracks`
  and `series`.

Schema reads use `application/schema+json` and do not load metadata, credentials
or media. Payload schemas are intentionally partial acceptance documentation,
not exhaustive upstream contracts: unknown upstream fields remain preserved.
Media-index schemas describe our own projection. Data resources remain raw JSON,
without a schema/data envelope. Only host-selected resources advertise schemas;
custom injected resources can supply their own optional `schemas`.

### Static assets, images and track maps

The `serve` command exposes these resources over stdio and standalone HTTP.
Definitions and registration belong to `@iracing-data/mcp`; this runtime owns
SDK loading, file snapshots and credential-free media downloads. Embedding hosts
can inject `assets: { catalogs, readMedia }` alongside tool services and catalogs.

`iracing://assets/cars`, `iracing://assets/tracks` and `iracing://assets/series`
return the raw ID-keyed upstream asset documents. Individual
entries are at `iracing://assets/{kind}/{id}` for each advertised kind.
They persist lazily as `cars-assets.json`, `tracks-assets.json` and
`series-assets.json` alongside the catalog snapshots.

Resource templates support prefix autocomplete for asset IDs. Image fields and
track-map layers complete from the selected `id` or `track_id` in the client's
completion context, suggesting only available, safely resolvable references.
Missing or invalid context and unknown IDs return no selector suggestions.
Completion can lazily load metadata but never downloads media.

`iracing://assets/{kind}/{id}/media` returns a per-asset media index:
`{ kind, id, images: [{ field, uri }], track_maps: [{ layer, uri, mimeType }] }`.
The URIs are ready-to-read MCP resources, not expiring download URLs. Missing,
null, unsupported and unsafe references are omitted. Empty arrays mean no
resolvable media is advertised. This works without autocomplete support and
loads metadata only; actual media availability is checked when its URI is read.

Image templates are `iracing://images/{kind}/{id}/{field}`. Supported fields are
`small_image`, `large_image`, `logo`, `sponsor_logo` and `group_image`; read the
entity's asset metadata first because missing/null fields fail explicitly.
Car/track filenames use the upstream asset folder, and bare series logos use
the verified `/img/logos/series/` path on the official static image host.

For maps, read `iracing://assets/tracks/{id}`, then choose an exact advertised
`track_map_layers` key for `iracing://track-maps/{track_id}/{layer}`.
Examples include `active`, `background`, `pitroad`, `start-finish` and `turns`.
These are separate SVG layers, not a composed map.

Media reads return MCP blob content: base64 bytes with their `mimeType`, not
JSON metadata. Client rendering support varies. Treat SVG as
untrusted media and sanitize it before inline rendering; do not execute scripts.
Downloads omit credentials, reject redirects/unexpected hosts/content types,
respect cancellation and a 15-second timeout, and enforce a 5 MiB binary limit.
Metadata is cached; media bytes are fetched per read.

All other asset fields remain available in metadata, including descriptive HTML,
manuals, paint-template references and screenshot/gallery tokens. Undocumented
URL bases are not guessed, and these references do not have binary resolvers.
HTTP authentication boundaries are unchanged; embedding hosts explicitly select
their asset resolvers and media reader.

## Historical result search

`search_race_results` accepts `source: "series"` or `source: "hosted"`.
Hosted search includes league races: supply `league_id` and optionally
`league_season_id`. Supply `cust_id` for a particular participant; no current
driver is assumed. Upstream gives `team_id` precedence over `cust_id`.

Supply a season year/quarter pair (series only), or UTC start/finish ranges.
Bounds are inclusive at the beginning and exclusive at the end. Follow the
upstream range restrictions; older searches need explicit end bounds. Filters
are source-specific: hosted supports car, track, session name, host and league;
series supports series, race week, event types and official-only. Both support
customer, team and category IDs. Names must first be resolved to IDs elsewhere.

Example arguments for participant activity in The Beer League:

```json
{
  "source": "hosted",
  "cust_id": 378767,
  "league_id": 8579,
  "start_range_begin": "2026-08-18T00:00:00Z",
  "start_range_end": "2026-11-16T00:00:00Z"
}
```

Each call retrieves one upstream chunk (`chunk_index` defaults to zero), without
local row slicing. `total_matches` and `total_chunks` describe the query;
`query_complete` is true only when this response includes every matching row.
The adapter validates manifest consistency and the selected chunk's row count.
It does not imply lifetime-history coverage. Repeated calls rerun the query:
results are not a stable cross-call snapshot. Use bounded historical ranges
and do not combine changed result sets as if they were one snapshot.

Results preserve upstream position indexing and ordering. Signed download URLs,
credentials and unrelated fields are not returned. If a projected chunk exceeds
the combined 64 KiB MCP response budget, the call fails with
`RESPONSE_LIMIT_EXCEEDED`; narrow the query rather than expecting truncation.
This tool does not classify special events or fetch detailed laps/results.

Custom HTTP hosts must supply `raceSearchQueries` alongside driver and
recent-race capabilities. The factory requires all three selectors before
registering tools; an incorrectly configured actor resolver fails closed with
`CONFIGURATION_ERROR`. The built-in Fetch adapter supplies all three.
Historical chunk retrieval uses an independent, unsigned HTTPS fetch rather
than inheriting the credentialed API client's transport.

## HTTP handler and standalone listener

The standalone `/mcp` route rejects non-loopback Host and Origin headers before
tool dispatch. Requests without Origin are allowed for direct local clients.
Embedding hosts retain responsibility for their own Host/Origin policy.

The development command uses the host-selected iRacing account and does **not**
authenticate HTTP callers. Keep it on loopback; do not expose it publicly.

```sh
pnpm exec dotenv -e .env -- iracing-data-mcp serve --transport http
```

The application serves MCP at `/mcp`; all other paths return an empty `404`.
`createHttpTransport` is a path-independent handler, not an application router.
An embedding host chooses the path and owns authentication and account selection:

```ts
import {
  createHttpTransport,
  createMcpServices,
  type McpCapabilities,
} from "@iracing-data/iracing-data-mcp";
import { Hono } from "hono";

// Supplied by the host; not selected by the transport.
declare const capabilities: McpCapabilities;
const handler = createHttpTransport({
  services: createMcpServices(capabilities),
  serveOptions: { maxRequestBodySize: 64 * 1024 },
});

const app = new Hono();
app.all("/integrations/iracing", (c) => handler.fetch(c.req.raw));
```

This single-account example does not authenticate callers. An authenticated host
must verify each request before forwarding it and supply that caller's account
services. Multi-user request-scope integration is deferred to a separate change.

### Account-scoped token providers

`AccessTokenProvider` is a `() => Promise<string>` contract, separate from
`ResolveActor`. `createTokenProvider({sessionStore, sessionKey, ...metadata})`
retains one OAuth client with an injected session store. It restores/refreshes
that selected session; it does not initiate login. `createFetchQueries(provider)` accepts any
implementation, including one closed over a verified user's linked account:

```ts
resolveCapabilities: async (actor, context) => {
  const account = await requireLinkedIracingAccount(actor.id, context.signal);
  return createFetchQueries(() =>
    linkedAccountTokens.getAccessToken(account.id),
  );
};
```

The host owns `requireLinkedIracingAccount` and `linkedAccountTokens`, including
authorization, refresh serialization and durable token rotation. Missing links
must fail closed with `ApplicationFailure("AUTHORIZATION_REQUIRED")`; never fall
back to the local file. Reuse one refresh owner per linked account, rather than
creating independent refresh queues for concurrent requests.

Tools depend on domain query capabilities, not on token storage or actor
authentication. The token provider never reads environment variables or selects
a credential path; the host supplies its store and explicit session key.

### Reuse one credential strategy across transports

The transports do not choose a credential source. Compose capabilities once,
then supply them to the selected transport:

```ts
import {
  createFetchQueries,
  createHttpTransport,
  createMcpServices,
  createStdioTransport,
  createTokenProvider,
} from "@iracing-data/iracing-data-mcp";
import { OAuthTokenDocumentSessionStore } from "@iracing-data/oauth-client";

const sessionKey = "local-mcp";
const tokenProvider = createTokenProvider({
  ...clientMetadata,
  sessionKey,
  sessionStore: new OAuthTokenDocumentSessionStore({
    filePath: credentialsPath,
    sessionKey,
  }),
});
const capabilities = createFetchQueries(tokenProvider);
const services = createMcpServices(capabilities);

// Choose a host; these examples are alternatives, not concurrent refresh owners.
createStdioTransport({
  services,
  serveOptions: {},
});
createHttpTransport({
  services,
  serveOptions: {},
});
```

`credentialsPath` and `clientMetadata` are host configuration. The CLI uses
this same token-provider implementation with its selected document store. Existing
actor-based composition remains available to custom hosts; HTTP transport
and stdio transports require only the resolved tool services.
The serve command injects the same reference catalogs for both transports, sharing
the same token provider as tools. Both transports use `createIracingMcpServer` to register
tools and resources before connecting. Embedded hosts may supply `catalogs` to
either transport, using `createReferenceCatalogs(directory, provider)`; omitting
it advertises tools only. The embedding host selects the catalog directory and
credential owner, just as it selects tool services.

### Lazy service ownership

`createFetchQueries(provider)` returns a `McpServices` instance with memoized
getters. The generated configuration and each query adapter are constructed
only when a query capability is first selected, then reused for that owner.
Construct one capability instance per credential owner outside request handlers;
creating a new instance per request defeats this lifetime.

```ts
const capabilities = createFetchQueries(accountTokenProvider);
const services = createMcpServices(capabilities);
// No query adapter or token lookup yet.
```

Adapters are cached, not access tokens or request context. Each API operation
still invokes the injected token provider for current credentials and receives
its own cancellation signal. The host retains the OAuth lifecycle/refresh owner
across requests. Lazy getters do not provide cross-process refresh locking.

For custom adapters, construct `new McpServices({ driverQueries: () => ...,
recentRaceQueries: () => ..., raceSearchQueries: () => ... })`.
`createMcpServices` also accepts a request-local capability resolver; its results
are deliberately not cached across requests or identities.

The SDK handles MCP protocol classification and stateless requests.
No custom long-lived MCP sessions or legacy SSE endpoint are provided.

## Implementation

- `src/cli/commands/serve/schema.ts`: Zod serve-option boundary
- `src/composition.ts`: lazy owner-scoped query getters and MCP selector bridge
- `src/cli/router.ts`: standalone `/mcp` application router
- `src/cli/server.ts`: optional Node listener
- `src/transports/http/index.ts`: path-independent HTTP handler
- `src/transports/stdio/index.ts`: stdio host using the same MCP factory
- `src/access-token.ts`: injected OAuth client/store lifecycle and token resolution
- `src/token-provider.ts`: account-scoped access-token provider contract
- `src/adapters/`: generated Fetch implementation and safe linked-response handling

Neither the MCP core nor the HTTP router depends on generated Fetch clients.
The Fetch choice is confined to `src/adapters/` and the local credential
adapter. A host can inject Axios, fixtures, or another provider instead.

```sh
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
pnpm verify
```

See [architecture](architecture.md), [agent guidance](AGENTS.md), and
[the tool-authoring skill](../../.agents/skills/add-mcp-tool/SKILL.md).
