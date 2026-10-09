# Application source navigation

Current architecture and lifetimes are documented beside their owners:

| Question                                           | Authoritative source                                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Startup, configuration and mount validation        | [production.ts](src/production.ts), [main.ts](src/main.ts)                                                                 |
| Process services and MCP session/exchange lifetime | [services.ts](src/services.ts), [mcp.ts](src/mcp.ts), [http.ts](src/http.ts)                                               |
| HTTP admission, security, cancellation and drain   | [http.ts](src/http.ts)                                                                                                     |
| Durable authorization, rotation and quarantine     | [session.ts](src/session.ts)                                                                                               |
| Generated endpoint boundary and bounded resolution | [gateway.ts](src/gateway/gateway.ts)                                                                                       |
| URL/DNS/TLS policy and parsing                     | [policy.ts](src/gateway/policy.ts), [transport.ts](src/gateway/transport.ts), [parsers.ts](src/gateway/parsers.ts)         |
| Tool execution and current cursor ownership        | [identity-content.ts](src/tools/identity-content.ts)                                                                       |
| Inputs/projections and continuation                | [contracts.ts](src/tools/contracts.ts), [collections.ts](src/tools/collections.ts), [search.ts](src/tools/search.ts)       |
| Shared retention                                   | [retention.ts](src/retention.ts)                                                                                           |
| Safe diagnostics and failure mapping               | [errors.ts](src/diagnostics/errors.ts), [logging.ts](src/diagnostics/logging.ts), [mapping.ts](src/diagnostics/mapping.ts) |

Production uses the 2025-era Streamable HTTP session model: initialize owns one
SDK server/transport pair, subsequent requests route by `Mcp-Session-Id`, and
DELETE or process shutdown disposes that pair. OAuth/session persistence, the
Data API gateway, retention and cursor owners remain process/account scoped.
Request abort/deadline state remains request/tool-operation scoped and must not
be captured by those longer-lived owners. The HTTP factory can still be composed
without a session ID generator for explicitly stateless protocol tests/embeddings.

Use the [README](README.md) for tools/workflows and [container guide](local-container.md)
for deployment, stopped credential recovery and rollback. Source describes the
shipped architecture; proposed extractions remain backlog work.
