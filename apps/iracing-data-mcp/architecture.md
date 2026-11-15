# MCP reference host architecture

The private `@iracing-data/mcp` package defines the server factory,
registration and the two tool-local contracts. **It does not import
a generated HTTP client.** The reference host is one consumer and chooses
the generated Fetch client.

| Responsibility | Owner |
| --- | --- |
| Tool contracts and explicit registration | [get_my_driver](../../packages/mcp/src/tools/get-my-driver/index.ts), [get_recent_races](../../packages/mcp/src/tools/get-recent-races/index.ts), [registrar](../../packages/mcp/src/register.ts) |
| Unconnected server factory | [factory.ts](../../packages/mcp/src/factory.ts) |
| Client-specific adapters and safe signed links | [adapters](src/adapters) |
| OAuth owner, refresh, persistence | [session.ts](src/session.ts) |
| Awilix actor and query resolution | [composition.ts](src/composition.ts) |
| Runtime host and port | [runtime-config.ts](src/runtime-config.ts), [runtime.ts](src/runtime.ts) |
| HTTP transport, ingress, cancellation, session lifetime, shutdown | [http.ts](src/http.ts) |
| Safe tool/host errors and diagnostics | [MCP errors](../../packages/mcp/src/diagnostics/errors.ts), [logging](src/diagnostics/logging.ts) |

The host's `composeMcpServices()` uses Awilix to inject `resolveActor(context)`
and `resolveDependencies(actor, context)` into request-local tool selectors.
No tool or transport stores the selected actor. The local default adapter
uses a dedicated CLI MCP credential document and a single OAuth owner. It
constructs Fetch `DriverQueries` and `RecentRaceQueries` behind those
interfaces. A Better Auth or another consumer supplies its own resolvers,
which can return account-linked providers for each verified actor.
Remote bearer identities are **not** mapped to the default local CLI account. The concrete
adapters handle linked HTTPS response envelopes without bearer forwarding,
cookies or redirect following, and map generated-client failures into safe
application codes. Neither tool retains cursors or account state.

Production uses the 2025-era Streamable HTTP session model: initialization
owns one SDK server/transport pair, subsequent requests route by
`Mcp-Session-Id`, and DELETE or shutdown disposes that pair. OAuth refresh
and durable credentials remain process-owned. Cancellation propagates
from HTTP disconnects into MCP handlers, through the injected query service,
and into generated and signed-link requests. The reference host can also
compose a stateless transport for explicit embedding/tests.

Express 5 owns route dispatch and bounded JSON parsing (64 KiB), including
rejection of compressed uploads. MCP bearer middleware runs before body
parsing when configured; Host/Origin checks remain app-owned. The
`@modelcontextprotocol/server` 2.3.1 SDK still requires the existing
session registry/transport path for sessionful HTTP compatibility. The
host preserves the ten-second shutdown drain, then cancels unfinished
work before shutting down the credential owner. It does not add tool
admission caps or automatic retries.

This changes the historical #473/#382 restrictions only to permit a
listener-free factory and request-local domain capability injection.
It deliberately removes the earlier eight-tool registry, generic
`execution.ts` wrapper and all retained cursor/search state.

See [README](README.md), [container guide](local-container.md),
[remote authorization](remote-authorization.md), and the
[MCP package boundary](../../packages/mcp/README.md).

The new `startMcpRuntime({config,dependencies,authorization?})` hosts the
server on the validated `config.host`/`config.port`; `createMcpRuntime()`
returns an unstarted HTTP runtime for embedding and tests. The Zod
`RuntimeEnvironmentSchema` applies defaults and transforms environment
keys directly into those runtime options. The Docker `startProduction()`
entry point retains its secure volume, OAuth and shutdown policy.

The retired generic error mapper and one-account `createMcpServices()`
facade are removed. Adapter-specific errors are handled at their concrete
Fetch boundary; token rotation, persistence and refresh failures remain in
the credential owner. The transport sees only request-selected query services.
