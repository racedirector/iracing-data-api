# Runtime boundaries

```
@iracing-data/mcp
  createIracingMcpServer(services)   # two tool contracts, no listener
            ^
            |
apps/iracing-data-mcp
  composition.ts                     # Awilix, verified actor + capabilities
  http.ts                            # mountable Hono router
  http-server.ts                     # optional TCP listener
  stdio.ts                           # local stdio transport
  credentials.ts                     # dedicated CLI token document
  adapters/                          # concrete generated Fetch implementation
```

This mirrors the FTR Events split: a small composition root creates
infrastructure, package routers mount into an existing Hono host, and the
listener remains optional. `createMcpRouter()` accepts a
`resolveActor(request)` function and a
`resolveCapabilities(actor, context)` function. Authentication happens
before capabilities are selected. Null identity returns 401 and never
falls back to the local account.

Local stdio has a single explicit CLI actor, and selects its token document
only when a tool performs an upstream call. It is not a general token refresh
service. The existing CLI owns obtaining/renewing tokens.

The official MCP SDK owns protocol handling in both transports. There is no
custom dispatcher, per-client server registry, OAuth resource endpoint,
JWT verifier, Docker importer, or HTTP account session. A host wanting
Better Auth can inject its authoritative session resolver and a linked
iRacing account resolver without changing either MCP tool.
