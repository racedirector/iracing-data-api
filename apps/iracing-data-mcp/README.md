# iRacing Data MCP runtime

Three read-only tools: `get_my_driver`, `get_recent_races`, and
`search_race_results`. The
`@iracing-data/mcp` package owns the listener-free MCP server and contracts.
This app supplies an optional Hono adapter, an optional Node listener, and a
local stdio executable. It does not implement an OAuth server, JWT verifier,
Docker credential importer, or session registry.

## Local stdio (default)

After publication, install the runtime with
`npm install -g @iracing-data/iracing-data-mcp@next` and configure clients to
execute `iracing-data-mcp`. The first release is not available until the stack
has landed and release smoke tests pass.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/iracing-data-mcp...' build
# Copy only if .env does not already exist, then configure its values.
cp .env.example .env
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
iracing-data-mcp --credentials /absolute/path/to/credentials.json
```

Selection order is `--credentials`, then `IRACING_MCP_CREDENTIAL_FILE`, then
the dedicated MCP default. Relative paths resolve from the process working
directory. There is no fallback to another credential file. Reconnect the
MCP client after selecting a different path. Each tool request restores the
selected file afresh, so replacing its credentials does not require reconnecting.
Restoration is serialized within the local connection so concurrent requests
observe persisted refresh-token rotation. The OAuth client refreshes expired
access tokens during restoration; it does not use an early-refresh window.

Before serving stdio, startup validates OAuth registration and reads the selected
credential document through the secure OAuth document reader. Missing, corrupt,
unsafe or unreadable credentials stop startup with actionable stderr diagnostics
and no MCP output. This preflight never refreshes tokens or contacts iRacing;
session restoration and refresh remain on demand.

Local restoration failures report the selected document, OAuth error code and
message on stderr. The original error is retained as the cause; token documents
and raw error objects are never logged. Missing sessions have a distinct
actionable diagnostic. MCP tool results still use `AUTHORIZATION_REQUIRED` or
`TOKEN_REFRESH_FAILED` and safe policy messages, not `INTERNAL_ERROR` or raw local
details. Resource callers can receive the local diagnostic message.

The stdio process writes MCP protocol messages only to stdout. It does not
listen on a port or start a browser login. Configure your MCP client to run
`iracing-data-mcp` after installing. In this workspace, use
`pnpm exec dotenv -e .env -- iracing-data-mcp` with the project root as its working
directory after building.

## Environment configuration

The executable **only consumes its supplied environment**. It never loads `.env`
or accepts env-file flags. Use the MCP client's environment configuration, your
deployment platform, or an external loader. The checked-in client configurations
and `pnpm mcp:local` use the repository's development-only
[dotenv CLI](https://github.com/entropitor/dotenv-cli):

```sh
pnpm exec dotenv -e .env -- iracing-data-mcp
```

Copy [the repository `.env.example`](../../.env.example) without overwriting an
existing `.env`, then configure it. It lists every supported MCP environment
option and the separate CLI-only login/API options. Dotenv CLI preserves existing
process environment values by default. Missing values are validated by the MCP,
not filled from hidden credential or registration fallbacks.

| Variable                      | Usage                              | Requirement / default                                                                                                               |
| ----------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `IRACING_AUTH_CLIENT`         | Local stdio OAuth registration     | Required, nonblank; must match the original login                                                                                   |
| `IRACING_AUTH_SECRET`         | Local stdio OAuth client secret    | Required for confidential registrations; omit or leave empty for public clients                                                     |
| `IRACING_MCP_CREDENTIAL_FILE` | Selected local OAuth JSON document | Defaults to `.iracing-data/iracing-data-mcp/credentials.json` under the process working directory; `--credentials` takes precedence |
| `IRACING_MCP_LISTEN_HOST`     | Optional HTTP listener             | `127.0.0.1`; nonempty                                                                                                               |
| `IRACING_MCP_PORT`            | Optional HTTP listener             | `3000`; integer from 1 to 65535                                                                                                     |

Invalid configuration reports the affected variable names and this documentation
link, never the supplied values or secrets. The runtime cannot infer whether a
registration is confidential or prove registration/session compatibility offline;
supply the correct secret when issued. HTTP embedding validates listener options
without requiring local OAuth registration or reading the local document.

For initial login use `pnpm iracing-data auth login --scope iracing.auth`.
Credential files must satisfy the OAuth document reader's checks (on POSIX:
current-user-owned directory mode `0700` and file mode `0600`, no symlinks).
See [CLI login setup](../iracing-data-cli/README.md#build-and-run-locally) for acquisition.
After fixing startup configuration, reconnect the MCP client. During a running
connection, replacing the selected credential document is still observed on the
next tool request.

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

### Account-scoped token providers

`AccessTokenProvider` is a `() => Promise<string>` contract, separate from
`ResolveActor`. `createFileAccessTokenProvider(path, metadata)` implements it
for a disk-backed OAuth session. `createFetchQueries(provider)` accepts any
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

`createFileCapabilities(path, metadata)` is the local convenience composition
of the file-backed provider and Fetch queries. Tools depend on domain query
capabilities, not on token storage or actor authentication.

### Reuse one credential strategy across transports

Neither `startMcpStdio` nor `createMcpRouter` chooses a token provider. Both
accept the same `ResolveCapabilities` callback. Define that callback once and
reuse it, so changing its account/token implementation applies to either host:

```ts
import {
  createFetchQueries,
  createMcpRouter,
  startMcpStdio,
  type ResolveCapabilities,
} from "@iracing-data/iracing-data-mcp";

const resolveCapabilities: ResolveCapabilities = async (actor, context) => {
  const account = await requireLinkedIracingAccount(actor.id, context.signal);
  return createFetchQueries(() =>
    linkedAccountTokens.getAccessToken(account.id),
  );
};

// Choose a host; these examples are alternatives, not concurrent refresh owners.
startMcpStdio({ actor: authorizedLocalActor, resolveCapabilities });
createMcpRouter({ resolveActor: verifyHttpRequest, resolveCapabilities });
```

The application supplies the identity and linked-account functions above.
HTTP verifies actors per request; stdio uses an actor explicitly authorized by
its host. The shipped `iracing-data-mcp` executable is a concrete file-backed
composition: it validates local configuration and credentials, then injects
`createFileCapabilities` into the generic stdio host. To use another strategy,
compose either public host with your own shared resolver; there is no hidden
per-transport token fallback or dynamic provider-module loader.

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
