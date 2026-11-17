# Runtime boundaries

```text
@iracing-data/mcp
  createIracingMcpServer(services)       # contracts, no listener
              ^
              |
apps/iracing-data-mcp
  cli/commands/serve/                   # options and host-account composition
  cli/access-token.ts                  # OAuth restoration through document store
  cli/router.ts                        # /mcp; other paths return empty 404
  cli/server.ts                        # optional TCP listener
  transports/http/index.ts             # path-independent fetch handler
  transports/stdio/index.ts            # stdio transport
  composition.ts                       # explicit services; optional actor composition
  credentials.ts                       # reusable file-backed provider helpers
  adapters/                            # generated Fetch implementation
```

`iracing-data-mcp serve` defaults to stdio. `serve --transport http` starts
the development listener at `127.0.0.1:3000`, using the same host-selected
credential strategy. HTTP does not authenticate callers; do not expose this
single-account development listener publicly. No fabricated HTTP actor is used.

`createHttpTransport({services, serveOptions})` returns the SDK's handler.
Embedding hosts choose their own route, authenticate callers, and provide
the appropriate services. The handler does not select credentials or actors.
Request-scoped Awilix dependencies are deferred to a separate change.

The existing actor-based `composeMcpServices` remains available for custom
hosts and stdio. `createMcpServices` composes services directly from
host-selected capabilities without requiring an actor.

The CLI reads only its supplied environment; dotenv CLI loads `.env` externally.
Credential documents are read on demand. The OAuth client owns restoration,
refresh coordination, and persistence of rotated credentials. Initial credential
acquisition remains a separate CLI login step.

The official MCP SDK owns protocol handling. There is no custom dispatcher,
session registry, OAuth resource endpoint, or JWT verifier in this app.
