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

Local stdio also registers one experimental resource, `iracing://reference/cars`.
At startup, it checks for a stored snapshot and asynchronously hydrates missing
metadata using the same OAuth token resolver as the tools. It atomically saves
materialized JSON under
`<credentials-directory>/reference/cars.json`. Later reads and subsequent
processes use that snapshot without requesting iRacing again. Resource reads
await any in-progress hydration and retry after failures. No partial snapshot
is published. This initial proof has no automatic expiration, refresh command,
or HTTP resource registration. Remove the snapshot manually to refetch.

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
- `src/http.ts`: mountable Hono MCP router
- `src/http-server.ts`: optional Node listener
- `src/stdio.ts`: stdio host using the same MCP factory
- `src/credentials.ts`: file-backed OAuth session restoration and durable refresh
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
