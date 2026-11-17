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
execute `iracing-data-mcp serve`. The first release is not available until the stack
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
using `IRACING_CREDENTIALS`. The setup above uses the CLI for initial
credential acquisition; loading the selected file is independent of the CLI.
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

## Environment configuration

The executable **only consumes its supplied environment**. It never loads `.env`
or accepts env-file flags. Use the MCP client's environment configuration, your
deployment platform, or an external loader. The checked-in client configurations
and `pnpm mcp:local` use the repository's development-only
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
