# MCP Runtime

The private `@iracing-data/mcp` package defines the two tool contracts
(`get_my_driver` and `get_recent_races`) and exposes a listener-free
server factory. It does not choose Fetch, Axios, credentials, or an HTTP host.

`apps/iracing-data-mcp` is a small **Hono composition and listener**:

| File | Responsibility |
| --- | --- |
| [runtime-config.ts](src/runtime-config.ts) | Zod environment defaults and transformation to runtime options |
| [runtime.ts](src/runtime.ts) | Hono app, official SDK MCP handler, optional bearer ingress, host/port listener and shutdown |
| [composition.ts](src/composition.ts) | Awilix registration for request-local actor and capability resolvers |
| [adapters](src/adapters) | Concrete Fetch client and linked-data operations |
| [session.ts](src/session.ts) | One local CLI credential owner, token rotation and persistence |
| [production.ts](src/production.ts) | Docker volume/secret validation and default CLI composition |
| [jwt-verifier.ts](src/jwt-verifier.ts) | Optional remote JWT verification |

An embedding host supplies `resolveActor(context)` and
`resolveDependencies(actor, context)`. Its actor resolver decides which
principal the request represents; the dependency resolver selects the
linked iRacing account and its data provider. Neither the Hono app nor
the MCP tool package assumes that all requests belong to a local account.

The default CLI implementation uses only the dedicated
`.iracing-data/iracing-data-mcp/credentials.json` file (Docker's
`/var/lib/iracing-data-mcp/credentials.json`). Remote ingress never
inherits that local account automatically. Future FTR Events Better Auth
integration should inject a verified actor resolver and a linked-account
capability resolver, **not** a second global credential owner.

## Protocol and security

`createMcpRuntime(options)` builds an unstarted Hono app;
`startMcpRuntime(options)` binds the listener to its validated host/port.
The official `@modelcontextprotocol/hono` middleware guards hostnames
and bounds request bodies. `createMcpHandler` owns MCP request routing,
including modern exchanges and the 2025 legacy **stateless** fallback.

The app intentionally has **no session registry, SSE transport manager,
cursor cache, or custom MCP request dispatcher**. The legacy stateless
protocol does not issue `Mcp-Session-Id`; GET/DELETE session operations
return 405. Auth is verified for each incoming request. Hono enforces
additional exact Host/Origin allowlists from the environment.

The runtime retains a public `/healthz` endpoint, OAuth protected-resource
metadata when configured, signed HTTPS link isolation in Fetch adapters,
and credential-owner shutdown. In remote mode the executable does not
grant access to the process-wide CLI account; an embedding host must
explicitly provide actor-to-account resolution.

See [README](README.md), [local Docker guide](local-container.md),
[remote authorization](remote-authorization.md), and the
[add-MCP-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md).
