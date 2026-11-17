# Runtime boundaries

```text
@iracing-data/mcp
  createIracingMcpServer(services)       # contracts, no listener
              ^
              |
apps/iracing-data-mcp
  cli/commands/serve/                   # options and host-account composition
  access-token.ts                      # shared OAuth client with injected store/key
  cli/router.ts                        # /mcp; other paths return empty 404
  cli/server.ts                        # optional TCP listener
  transports/http/index.ts             # path-independent fetch handler
  transports/stdio/index.ts            # stdio transport
  composition.ts                       # lazy query getters and explicit tool selectors
  adapters/                            # generated Fetch implementation
```

`iracing-data-mcp serve` defaults to stdio. `serve --transport http` starts
the development listener at `127.0.0.1:3000`, using the same host-selected
credential strategy. HTTP does not authenticate callers; do not expose this
single-account development listener publicly. No fabricated HTTP actor is used.

`createHttpTransport({services, serveOptions})` returns the SDK's handler.
Embedding hosts choose their own route, authenticate callers, and provide
the appropriate services. The handler does not select credentials or actors.
Multi-user request-scope integration is deferred to a separate change.

Both transports accept `IracingToolServices`. `createMcpServices` bridges
host-selected capabilities to those selectors without requiring an actor.
The actor-based `composeMcpServices` helper remains available for custom hosts;
neither transport resolves actors.

`McpServices` uses explicit, memoized getters rather than a DI container or
proxy. The Fetch composition lazily constructs one generated configuration and
only the query adapters actually selected. Owners retain these instances across
requests. Adapters never cache request context or access-token values.

The token provider and OAuth refresh owner live with the selected credential
owner, not an HTTP request. A host may select a different owner's capabilities
for each request; the selector bridge does not cache resolver results across
requests. Constructing capabilities inside that resolver on every call defeats
owner-level reuse.

The CLI reads only its supplied environment; dotenv CLI loads `.env` externally.
Credential documents are read on demand. The OAuth client owns restoration,
refresh coordination, and persistence of rotated credentials. Initial credential
acquisition remains a separate CLI login step.
The document store loads once per owner; restart the process after replacing its
file. The token provider propagates restoration failures unchanged and does not
log them. Storage quarantine remains owned by the injected store.

The official MCP SDK owns protocol handling. There is no custom dispatcher,
session registry, OAuth resource endpoint, or JWT verifier in this app.
