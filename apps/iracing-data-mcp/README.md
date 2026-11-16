# iRacing Data MCP runtime

Three read-only tools: `get_my_driver`, `get_recent_races`, and
`search_race_results`. The private
`@iracing-data/mcp` package owns the listener-free MCP server and contracts.
This app supplies an optional Hono adapter, an optional Node listener, and a
local stdio executable. It does not implement an OAuth server, JWT verifier,
Docker credential importer, or session registry.

## Local stdio (default)

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm iracing-data auth login --scope iracing.auth
pnpm mcp:local
```

The local executable loads a file-backed OAuth session, defaulting to
`.iracing-data/iracing-data-mcp/credentials.json`. Override its location
using `IRACING_MCP_CREDENTIAL_FILE`. The setup above uses the CLI for initial
credential acquisition; loading the selected file is independent of the CLI.
The runtime refreshes expired access tokens on demand and saves rotated
credentials to the same file. Set `IRACING_AUTH_CLIENT` and, for confidential
clients, `IRACING_AUTH_SECRET` to the registration used for CLI login.
If renewal fails, sign in again through the CLI. Do not start two
credential owners against the same rotating refresh token.

For an explicit path in a client command, pass `--credentials`:

```sh
node apps/iracing-data-mcp/dist/main.js --credentials /absolute/path/to/credentials.json
```

Selection order is `--credentials`, then `IRACING_MCP_CREDENTIAL_FILE`, then
the dedicated MCP default. Relative paths resolve from the process working
directory. There is no fallback to another credential file. Reconnect the
MCP client after selecting a different path. Each tool request restores the
selected file afresh, so replacing its credentials does not require reconnecting.
Restoration is serialized within the local connection so concurrent requests
observe persisted refresh-token rotation. The OAuth client refreshes expired
access tokens during restoration; it does not use an early-refresh window.

Local stdio exposes shared reference catalogs:

| Collection              | Entity template                        | Snapshot           |
| ----------------------- | -------------------------------------- | ------------------ |
| `iracing://cars`        | `iracing://cars/{car_id}`              | `cars.json`        |
| `iracing://tracks`      | `iracing://tracks/{track_id}`          | `tracks.json`      |
| `iracing://car-classes` | `iracing://car-classes/{car_class_id}` | `car-classes.json` |

Collections appear in `resources/list`; entity templates appear in
`resources/templates/list`. Discovery descriptions explain how to resolve race
result IDs. To answer which car a driver used, obtain the participant's `car_id`
from recent races or result search, then read `iracing://cars/<car_id>`. Resolve
track and class IDs the same way. Class ID zero is valid upstream.

Each read returns `application/json` text containing `{ "schema": ..., "data": ... }`.
`schema` is the JSON Schema for `data`: an array for a collection or an object for
an entity. It is generated from the canonical Zod schemas in
`@iracing-data/api-schema` (`src/schema/json.ts`) and includes titles,
descriptions, identifiers, relationships and modeled units/formats. Unknown
upstream properties remain in `data`; the schema explicitly permits them and
does not claim their semantics are modeled. Read `data.car_id` for an entity,
or iterate `data` for a collection. Snapshot files remain unwrapped upstream JSON.

This replaces the experimental bare-array/bare-object read format. Consumers
must now access `data`; resource URIs and on-disk snapshots are unchanged.

### Static assets, images and track maps

The local runtime also advertises `iracing://assets/cars`,
`iracing://assets/tracks` and `iracing://assets/series`. These reads return
`{ schema, data }` with the original ID-keyed asset documents; entity templates
are `iracing://assets/{kind}/{id}` for each advertised kind.

For actual image bytes, read `iracing://images/{kind}/{id}/{field}`, where `kind`
is `cars`, `tracks` or `series` and `field` is `small_image`, `large_image`,
`logo`, `sponsor_logo` or `group_image`. Availability is determined by the asset
entry, not by the template alone: missing/null fields and unknown IDs fail
explicitly. Bare car/track filenames resolve relative to the metadata `folder`;
bare series logos use the verified `/img/logos/series/` location. Absolute/root
image paths must stay on the official static image host under `/img/`.

Track asset entries advertise `track_map` and `track_map_layers`. Read a layer
using `iracing://track-maps/{track_id}/{layer}` with an exact advertised layer
name, such as `active`, `background`, `pitroad`, `start-finish` or `turns`.
These are separate SVG layers, not a composed map. Example:

```text
iracing://assets/tracks/1
iracing://track-maps/1/active
iracing://images/tracks/1/logo
```

Media reads return MCP **blob resource content** (base64 bytes and `mimeType`),
not JSON `{ schema, data }`. Client support determines whether those bytes are
rendered as an image. Treat SVG as untrusted media; sanitize it before inline
HTML rendering and do not execute embedded scripts.

All asset metadata uses the same lazy validation, snapshot and indexed lookup
mechanisms as catalogs. Raw documents persist at
`<credentials-directory>/reference/cars-assets.json`, `tracks-assets.json` and
`series-assets.json`; parsed metadata is reused for the process lifetime, with
no warmup or automatic expiry. Image/map bytes are fetched per read, not stored
in these metadata snapshots. Requests omit credentials, reject redirects and
unexpected hosts/content types, respect cancellation and a 15-second timeout,
and enforce a 5 MiB binary limit (base64 encoding adds overhead).

All other fields in the static schemas remain available through asset metadata,
including descriptive HTML, gallery/screenshot tokens, manuals and paint-template
references. Their undocumented URL bases or filename conventions are **not**
guessed; they do not have binary download resolvers.

Catalogs are lazy: startup and discovery do not read snapshots, authenticate,
or fetch data. The first resource read loads and validates the JSON snapshot;
only a missing snapshot triggers an upstream fetch using the same OAuth token
resolver as the tools. There is no cache warming.
It validates and atomically saves each dataset under
`<credentials-directory>/reference/<snapshot>`, then builds an in-memory
index by its entity ID. Collection and individual-entity requests share the same
hydration and index, including concurrent reads. The parsed JSON and index are
cached for the local process lifetime, not per MCP request or session. A restarted process reads
the existing validated snapshot instead of requesting iRacing again.
Errors, duplicate IDs and missing entities are reported rather than returning empty data.

These reference snapshots have no automatic expiration, refresh command,
automatic relationship traversal, or HTTP resource registration. Remove the
specific snapshot and reconnect to refetch it. Changing data such as results and
member statistics must not use permanent reference snapshots.

`src/resources/catalogs/resolver.ts` owns shared indexing and snapshot composition;
`src/resources/snapshots.ts` owns atomic persistence;
`src/resources/catalogs/register.ts` owns catalog discovery/read handlers.
`src/resources/assets/` groups asset resolution, media reads and registration.
Concrete dataset schemas, IDs, descriptions and SDK
loaders live in `src/adapters/catalog.ts` (which imports canonical payload schemas); there are no per-dataset resolver or
registration implementations.

The stdio process writes MCP protocol messages only to stdout. It does not
listen on a port or start a browser login. Configure your MCP client to run
`node apps/iracing-data-mcp/dist/main.js` with the project root as its
working directory after building.

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

## Embedding in Hono HTTP

The HTTP router does not choose an iRacing account or trust incoming identity
headers. An embedding host must authenticate each incoming `Request`, then
provide actor-owned query capabilities:

```ts
import { createMcpRouter } from "@iracing-data/iracing-data-mcp";
import { Hono } from "hono";

const app = new Hono().route(
  "/mcp",
  createMcpRouter({
    resolveActor: async (request) => {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      return session?.user
        ? { provider: "host-session", id: session.user.id }
        : null;
    },
    resolveCapabilities: async (actor, context) =>
      linkedIracingQueriesForActor(actor, context.signal),
  }),
);
```

The `auth` and `linkedIracingQueriesForActor` values above are provided by
the embedding application, not this package. Only the host may decide
which linked iRacing account a verified actor may access.

For a separate HTTP process, call `startMcpHttpServer` with
`config`, `resolveActor`, and `resolveCapabilities`.
`parseConfig(process.env)` applies the default listener address
`127.0.0.1:3000`. Standalone HTTP still **requires** caller-provided
authentication; it never uses the local CLI account by default.

The SDK handles MCP protocol classification and stateless requests.
No custom long-lived MCP sessions or legacy SSE endpoint are provided.

## Implementation

- `src/config.ts`: Zod defaults and transformation to runtime options
- `src/composition.ts`: Awilix dependency composition around an already verified actor
- `src/transports/http/index.ts`: small HTTP barrel for the router and listener
- `src/transports/http/router.ts`: mountable Hono MCP router
- `src/transports/http/server.ts`: optional Node listener
- `src/transports/stdio/index.ts`: stdio host using the same MCP factory
- `src/resources/`: feature-grouped catalogs and assets, with shared snapshots
- `src/credentials.ts`: file-backed OAuth session restoration and durable refresh
- `src/adapters/`: generated Fetch implementation and safe linked-response handling

Neither the MCP core nor the HTTP router depends on generated Fetch clients.
The Fetch choice is confined to `src/adapters/` and the local credential
adapter. A host can inject Axios, fixtures, or another provider instead.

`src/index.ts` preserves the package-root hosting exports. Transport and resource
features each have directory barrels; concrete generated SDK selection remains
confined to `src/adapters/`.

```sh
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
pnpm verify
```

See [architecture](architecture.md), [agent guidance](AGENTS.md), and
[the tool-authoring skill](../../.agents/skills/add-mcp-tool/SKILL.md).

## Local authentication diagnostics

The repository's OpenCode wiring loads `.env` (when present) for OAuth client
metadata and selects `.iracing-data/credentials.json` with `--credentials`.
Standalone callers can select a document with that flag or
`IRACING_MCP_CREDENTIAL_FILE`. OAuth restoration failures retain their original
errors and report the selected path, error code, and message on stderr (never
stdout). Missing sessions report the selected document and how to override it.
Token documents and raw error objects are not logged.
