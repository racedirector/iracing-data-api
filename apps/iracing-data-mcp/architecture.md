# Runtime boundaries

```
@iracing-data/mcp
  createIracingMcpServer(services)   # three tool contracts, no listener
            ^
            |
apps/iracing-data-mcp
  composition.ts                     # Awilix, verified actor + capabilities
  transports/
    index.ts                         # transport barrel
    http/
      index.ts                       # HTTP exports only
      router.ts                      # mountable Hono router
      server.ts                      # optional TCP listener
    stdio/index.ts                   # local stdio composition
  resources/
    index.ts                         # resource barrel
    snapshots.ts                     # lazy atomic JSON persistence
    catalogs/
      index.ts                       # catalog exports
      resolver.ts                    # shared validation and ID index
      register.ts                    # schema/data resource handlers
    assets/
      index.ts                       # asset exports
      resolver.ts                    # safe image/map URL resolution
      media.ts                       # bounded unsigned binary reads
      register.ts                    # metadata, image and map resources
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
from the selected file only when a tool or resource needs an upstream call. The OAuth
client owns session restoration, refresh and persistence of rotated credentials.
Credential acquisition is separate from file loading: the current setup uses
the CLI to obtain the initial document, but the loader does not depend on the
CLI process or its login implementation.

Generated SDK selection stays in `adapters/`, including the catalog and asset
metadata loaders. Resource features have no generated-client dependency.
Public package-root hosting exports are unchanged; the executable remains
`dist/main.js`. Only local stdio registers static resources; HTTP identity and
capability boundaries are unchanged.

The official MCP SDK owns protocol handling in both transports. There is no
custom dispatcher, per-client server registry, OAuth resource endpoint,
JWT verifier, Docker importer, or HTTP account session. A host wanting
Better Auth can inject its authoritative session resolver and a linked
iRacing account resolver without changing the MCP tools.
