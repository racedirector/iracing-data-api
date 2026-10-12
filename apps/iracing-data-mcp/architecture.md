# Application source navigation

The app hosts `@iracing-data/mcp-server`, which owns MCP registration, tools and
Data API orchestration. The app retains HTTP/session composition, ingress auth,
credential lifecycle and process configuration. Current lifetimes are documented
beside their owners:

| Question                                           | Authoritative source                                                                                                                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup, configuration and mount validation        | [production.ts](src/production.ts), [main.ts](src/main.ts)                                                                                                                                               |
| Process services and MCP session/exchange lifetime | [services.ts](../../packages/mcp/server/src/services.ts), [mcp.ts](../../packages/mcp/server/src/mcp.ts), [http.ts](src/http.ts)                                                                         |
| Express HTTP, security, cancellation and drain     | [http.ts](src/http.ts)                                                                                                                                                                                   |
| Durable authorization, rotation and quarantine     | [session.ts](src/session.ts)                                                                                                                                                                             |
| Generated endpoint boundary and bounded resolution | [gateway.ts](../../packages/mcp/server/src/gateway/gateway.ts)                                                                                                                                           |
| URL/DNS/TLS policy and parsing                     | [policy.ts](../../packages/mcp/server/src/gateway/policy.ts), [transport.ts](../../packages/mcp/server/src/gateway/transport.ts), [parsers.ts](../../packages/mcp/server/src/gateway/parsers.ts)         |
| Tool execution and current cursor ownership        | [identity-content.ts](../../packages/mcp/server/src/tools/identity-content.ts)                                                                                                                           |
| Inputs/projections and continuation                | [contracts.ts](../../packages/mcp/server/src/tools/contracts.ts), [collections.ts](../../packages/mcp/server/src/tools/collections.ts), [search.ts](../../packages/mcp/server/src/tools/search.ts)       |
| Shared retention                                   | [retention.ts](../../packages/mcp/server/src/retention.ts)                                                                                                                                               |
| Safe diagnostics and failure mapping               | [errors.ts](../../packages/mcp/server/src/diagnostics/errors.ts), [logging.ts](../../packages/mcp/server/src/diagnostics/logging.ts), [mapping.ts](../../packages/mcp/server/src/diagnostics/mapping.ts) |

Production uses the 2025-era Streamable HTTP session model: initialize owns one
SDK server/transport pair, subsequent requests route by `Mcp-Session-Id`, and
DELETE or process shutdown disposes that pair. OAuth/session persistence, the
Data API gateway, retention and cursor owners remain process/account scoped.
Request abort state remains request/tool-operation scoped and must not
be captured by those longer-lived owners. The HTTP factory can still be composed
without a session ID generator for explicitly stateless protocol tests/embeddings.

Use the [README](README.md) for tools/workflows and [container guide](local-container.md)
for deployment, stopped credential recovery and rollback. Source describes the
shipped architecture. The [package boundary](../../packages/mcp/server/README.md)
documents the temporary service dependencies retained by this first extraction.

See [remote authorization](remote-authorization.md) for the optional MCP ingress
resource-server boundary, distinct from the durable iRacing credential owner.

Express 5 owns route dispatch, bounded JSON parsing (64 KiB, compressed uploads
rejected), ordinary 404 responses and async error dispatch. Official MCP Express
bearer middleware runs before parsing; the Node adapter forwards request-local
AuthInfo and owns HTTP conversion. Exact Host/Origin checks remain app-owned
because the SDK host check ignores ports and the established policy also rejects
duplicate Host headers.

The installed server SDK 2.3.1 only offers stateless legacy fallback in
createMcpHandler, so the host retains the #432 session registry and legacy
Streamable HTTP transport for initialize/list/call continuity and DELETE cleanup.
The transport hooks remain solely to bridge HTTP disconnect/shutdown to legacy
SDK cancellation and sanitize protocol/tool errors; regressions cover both.

The speculative eight-call admission cap and 30-second tool deadline are removed.
Node owns ordinary header/upload timeouts. A ten-second shutdown drain remains:
it lets active HTTP work finish, then cancels unfinished work and closes sessions
before the credential owner's shutdown hook, so process termination cannot hang
on an incomplete upload, SSE connection or stalled upstream tool. The active
request set exists only to cancel that work during shutdown.
