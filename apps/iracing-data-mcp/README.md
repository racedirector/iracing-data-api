# iRacing Data MCP runtime

Two read-only tools: `get_my_driver` and `get_recent_races`. The private
`@iracing-data/mcp` package owns the listener-free MCP server and contracts.
This app supplies an optional Hono adapter, an optional Node listener, and a
local stdio executable. It does not implement an OAuth server, JWT verifier,
Docker credential importer, or session registry.

## Local stdio (default)

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/iracing-data-mcp...' build
# Authenticate using the CLI's existing login command with iracing.auth.
pnpm mcp:local
```

The local executable uses the CLI's dedicated MCP credential document at
`.iracing-data/iracing-data-mcp/credentials.json`. Override its location
using `IRACING_MCP_CREDENTIAL_FILE`. The CLI is responsible for initial login.
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
MCP client after selecting or replacing a file: the current session store
caches its first read.

The stdio process writes MCP protocol messages only to stdout. It does not
listen on a port or start a browser login. Configure your MCP client to run
`node apps/iracing-data-mcp/dist/main.js` with the project root as its
working directory after building.

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
        ? { provider: "ftr-events", id: session.user.id }
        : null;
    },
    resolveCapabilities: async (actor, context) =>
      linkedIracingQueriesForActor(actor, context.signal),
  }),
);
```

The `auth` and `linkedIracingQueriesForActor` values above are provided by
the embedding application, not this package. This follows the separation in
FTR Events: `services/hono-api` composes infrastructure, and
`packages/http-api` exposes mountable routers. Only the host may decide
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
- `src/credentials.ts`: local CLI credential restoration and durable refresh
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
