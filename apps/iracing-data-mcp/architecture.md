# Runtime boundaries

```
@iracing-data/mcp
  createIracingMcpServer(services)   # three tool contracts, no listener
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

Both transports accept the same explicit `resolveCapabilities(actor, context)`
contract. Stdio receives its authorized actor from the host; HTTP verifies
actors per request. Neither transport selects a token strategy or reads
environment configuration.

The standalone executable explicitly composes the file-backed provider. It
parses supplied environment and validates the selected credential document
before starting stdio, without network access. In-repo clients use dotenv CLI
outside the executable to load `.env`. The OAuth
client owns session restoration, refresh and persistence of rotated credentials.
Credential acquisition is separate from file loading: the current setup uses
the CLI to obtain the initial document, but the loader does not depend on the
CLI process or its login implementation.

The official MCP SDK owns protocol handling in both transports. There is no
custom dispatcher, per-client server registry, OAuth resource endpoint,
JWT verifier, Docker importer, or HTTP account session. A host wanting
Better Auth can inject its authoritative session resolver and a linked
iRacing account resolver without changing the MCP tools.
