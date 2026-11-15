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
  credentials.ts                     # file-backed OAuth session restoration
  adapters/                          # concrete generated Fetch implementation
```

A small composition root creates infrastructure, the router mounts into an
existing Hono host, and the listener remains optional. `createMcpRouter()` accepts a
`resolveActor(request)` function and a
`resolveCapabilities(actor, context)` function. Authentication happens
before capabilities are selected. Null identity returns 401 and never
falls back to the local account.

Local stdio has a single explicit local actor and restores an OAuth session
from the selected file only when a tool performs an upstream call. The OAuth
client owns session restoration, refresh and persistence of rotated credentials.
Credential acquisition is separate from file loading: the current setup uses
the CLI to obtain the initial document, but the loader does not depend on the
CLI process or its login implementation.

The official MCP SDK owns protocol handling in both transports. There is no
custom dispatcher, per-client server registry, OAuth resource endpoint,
JWT verifier, Docker importer, or HTTP account session. A host wanting
Better Auth can inject its authoritative session resolver and a linked
iRacing account resolver without changing either MCP tool.
