# Application source navigation

The app hosts `@iracing-data/mcp-tools`, which owns MCP registration, tools and
Data API orchestration. The app retains HTTP/session composition, ingress auth,
credential lifecycle and process configuration. Current lifetimes are documented
beside their owners:

| Question                                                      | Authoritative source                                                                                                                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup/configuration                                         | [production.ts](src/production.ts), [main.ts](src/main.ts)                                                                                                                                                              |
| Process credentials/access                                    | [session.ts](src/session.ts), [services.ts](src/services.ts)                                                                                                                                                            |
| Caller-owned server, Express, ingress, cancellation and drain | [http.ts](src/http.ts)                                                                                                                                                                                                  |
| Registrar and generated access seam                           | [register.ts](../../packages/mcp/tools/src/register.ts), [services.ts](../../packages/mcp/tools/src/services.ts)                                                                                                        |
| Tool contracts, invocations and projection                    | [tools](../../packages/mcp/tools/src/tools)                                                                                                                                                                             |
| Linked materialization                                        | [linked-response.ts](../../packages/mcp/tools/src/linked-response.ts)                                                                                                                                                   |
| Scoped collection/search state                                | [continuation.ts](../../packages/mcp/tools/src/continuation.ts), [collections.ts](../../packages/mcp/tools/src/tools/collections.ts), [search cursor](../../packages/mcp/tools/src/tools/search-driver-races/cursor.ts) |
| Safe failures and host diagnostics                            | [errors.ts](../../packages/mcp/tools/src/diagnostics/errors.ts), [logging.ts](src/diagnostics/logging.ts), [mapping.ts](src/diagnostics/mapping.ts)                                                                     |

Production uses the 2025-era Streamable HTTP session model: initialize owns one
SDK server/transport pair, subsequent requests route by `Mcp-Session-Id`, and
DELETE or process shutdown disposes that pair. OAuth/session persistence remains process-owned. Retained tool state is isolated
by the host-provided opaque continuation scope across logical MCP sessions.
Request abort state remains request/tool-operation scoped and must not
be captured by those longer-lived owners. The HTTP factory can still be composed
without a session ID generator for explicitly stateless protocol tests/embeddings.

Use the [README](README.md) for tools/workflows and [container guide](local-container.md)
for deployment, stopped credential recovery and rollback. Source describes the
shipped architecture. The [package boundary](../../packages/mcp/tools/README.md)
documents the final registrar and generated-client access boundary.

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
