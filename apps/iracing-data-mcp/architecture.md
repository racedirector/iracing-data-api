# MCP reference host architecture

The private `@iracing-data/mcp` package defines the server factory,
registration and the two tool-local contracts. **It does not import
a generated HTTP client.** The reference host is one consumer and chooses
the generated Fetch client.

| Responsibility                                                    | Owner                                                                                                                                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool contracts and explicit registration                          | [get_my_driver](../../packages/mcp/src/tools/get-my-driver/index.ts), [get_recent_races](../../packages/mcp/src/tools/get-recent-races/index.ts), [registrar](../../packages/mcp/src/register.ts) |
| Unconnected server factory                                        | [factory.ts](../../packages/mcp/src/factory.ts)                                                                                                                                                   |
| Client-specific adapters and safe signed links                    | [adapters](src/adapters)                                                                                                                                                                          |
| OAuth owner, refresh, persistence and capability composition      | [session.ts](src/session.ts)                                                                                                                                                                      |
| HTTP transport, ingress, cancellation, session lifetime, shutdown | [http.ts](src/http.ts)                                                                                                                                                                            |
| Safe tool/host errors and diagnostics                             | [MCP errors](../../packages/mcp/src/diagnostics/errors.ts), [host mapping](src/diagnostics/mapping.ts), [logging](src/diagnostics/logging.ts)                                                     |

The host's `createMcpServices()` constructs a generated Fetch
`Configuration` using one OAuth-owner token callback, then independently
constructs `DriverQueries` and `RecentRaceQueries` adapters from that
configuration. Request-local selectors guard against closed credential
owners; the MCP tools see only their capability interfaces. The concrete
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
