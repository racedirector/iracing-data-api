# Local iRacing Data API MCP

This private application exposes two explicit, read-only MCP tools over a consumer-owned
Data API client and OAuth lifecycle. Run one local Docker
container and connect an MCP client on the same machine. It supports Data API
queries with `iracing.auth`; it provides no telemetry, full profile lookup,
arbitrary API proxy, writes, unbounded history or hosted multi-user service.

## Runtime composition

`createMcpRuntime({config, dependencies})` constructs an unstarted HTTP
host. `startMcpRuntime()` binds the host and port from `config`.
`parseRuntimeConfig(process.env)` is a Zod defaulting/transformation boundary;
set `IRACING_MCP_PORT` to select a port and `IRACING_MCP_LISTEN_HOST`
to select the interface. Default host/port are `127.0.0.1:3000`.

Awilix composes two injected contracts: `resolveActor(context)` returns a
verified actor or null, and `resolveDependencies(actor, context)` supplies
the driver's and recent-race query capabilities for that actor. The HTTP
runtime never reads credentials and does not select an iRacing account.
The local adapter uses `.iracing-data/iracing-data-mcp/credentials.json`,
the CLI's **dedicated MCP** token document. Docker instead uses
`/var/lib/iracing-data-mcp/credentials.json`, with its existing secure
volume/import workflow. An alternate credential document may be supplied
through `IRACING_MCP_CREDENTIAL_FILE`. Refresh-token documents must never
be used simultaneously by two owners.

Remote bearer identities are not automatically mapped to that local account:
without explicit actor and dependency providers, remote identity selection
fails closed. For future FTR Events Better Auth integration, provide a
verified session actor and linked iRacing query capabilities; no new OAuth
owner or generated client is required in `@iracing-data/mcp`.

## Set up and connect

Follow the [local container guide](local-container.md) for the exact frozen build,
Compose commands, host CLI login, credential directory and optional secret file.
Login requests `iracing.auth` and uses the same registered client ID as the
container. The host CLI owns browser authorization; the container has no browser
OAuth routes. Auth-only credentials cannot use the CLI's profile-based `whoami`.

After starting the container, follow the [client connection guide](clients.md).
The checkout includes project configs for Claude Code, VS Code/Copilot, Cursor,
Gemini CLI, Codex, and OpenCode, plus a Cline merge template. Ollama can provide
OpenCode's local model. ChatGPT web uses the documented private-tunnel workflow.

Automated tests validate client config invariants and use the official MCP client
over local Streamable HTTP with synthetic data; they do not establish every
client's native UI or live iRacing behavior. Registration alone does not establish
valid iRacing authorization. Other local clients must support Streamable HTTP at
`http://127.0.0.1:3000/mcp`. The supported protocol versions are
`2025-11-25`, `2025-06-18` and `2025-03-26`; stdio is unsupported.

`GET /healthz`, initialization and tool listing remain available when credentials
are missing or corrupt. Health reports liveness and authorization state, not proof
that an upstream API operation will succeed. Authenticated tool calls require a
valid durable credential document.

## Tool inputs and results

The MCP package exposes exactly two tools. Both reject unknown input keys,
numeric strings and credential arguments before selecting dependencies. The
host composes generated Fetch clients, OAuth credentials, safe signed-link
fetching and normalized data behind the tool-local service contracts.
A separate consumer may supply its own Axios or fake implementations.

| Tool | Arguments | Output |
| --- | --- | --- |
| `get_my_driver` | `{}` | Authenticated customer ID and display name |
| `get_recent_races` | Optional `cust_id`, `limit` (1–10, default 10) | At most ten entries from the upstream recent-race window, including season, track, car, incidents and finish fields |

Recent races preserve upstream order and position indexing, including
negative sentinels. `position_basis: "upstream"` identifies the source
convention. This is **not** a comprehensive race history; there are no
continuation cursors. Both tools return allowlisted `structuredContent`
plus equivalent JSON text; the combined serialized response is capped at
64 KiB. Optional missing race fields normalize to `null`.

Typical workflow: call `get_my_driver` with `{}`, then
`get_recent_races` with `{ "limit": 10 }`. For a particular customer,
pass a positive integer `cust_id` and verify that the upstream response
identifies the same customer. Unknown data, auth failures and unsafe links
are sanitized rather than presented to the model.

## Error handling

Errors return `isError:true`, safe JSON text and
`structuredContent.error` with fixed `code`, `message`, `retryable`, generated
`request_id`, and bounded optional `reason`/`retry_after_seconds`.

| Code                      | Action                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INVALID_INPUT`           | Correct arguments; no retry until changed.                                                                                                                       |
| `AUTHORIZATION_REQUIRED`  | Stop/drain, host login with `iracing.auth`, restart. Missing, invalid, insufficient-scope and persistence failures have bounded reasons.                         |
| `TOKEN_REFRESH_FAILED`    | Retry only when the envelope has `retryable:true` and `reason:"transient_refresh"`. Unknown consumption or rotation is non-retryable: keep stopped and re-login. |
| `UPSTREAM_UNAUTHORIZED`   | Inspect account entitlement/access; no refresh loop.                                                                                                             |
| `RATE_LIMITED`            | Wait for the bounded retry hint/cooldown, then retry.                                                                                                            |
| `UPSTREAM_UNAVAILABLE`    | Network/timeout/5xx: bounded later retry.                                                                                                                        |
| `DATA_RESOLUTION_FAILED`  | Malformed data/unsafe link: correct the source/query or report the request ID; no blind retry.                                                                   |
| `RESPONSE_LIMIT_EXCEEDED` | Reduce result size or choose fewer races.                                                                     |
| `CURSOR_EXPIRED`          | The upstream signed link expired; retry a new operation.                                                                                                        |
| `NOT_FOUND`               | Check supplied customer identity.                                                                                                              |
| `CONFIGURATION_ERROR`     | Repair client/configuration/mount permissions while stopped, then restart.                                                                                       |
| `INTERNAL_ERROR`          | Report the safe request ID for support.                                                                                                                          |

There is no automatic retry/sleep. JSON stderr logs use fixed redacted diagnostics
and application-generated request IDs. Do not share token documents, secrets,
environment dumps, bearer headers, cookies or signed cache URLs for support.

Stop before re-login, logout, permission repair, import or credential replacement;
see [tested recovery commands](local-container.md#stop-repair-restart-logout).
For uncertain rotation or failed shutdown cleanup, keep stopped and re-login before
restart. Never restore consumed refresh-token backups; follow the container guide.
The [session owner](src/session.ts) documents quarantine and shutdown semantics.

## Security and supported deployment

Use the provided [Compose configuration](compose.yaml) and operator guide. Keep the
published port loopback-only and run exactly one credential owner. Multiple
refreshing owners and hot credential replacement are unsupported. Local processes
can access this unauthenticated boundary; it does not defend against malicious
same-user processes. Treat upstream names/text as untrusted data.

See [production configuration](src/production.ts), [Hono runtime](src/runtime.ts)
and [linked responses](../../packages/mcp/src/linked-response.ts) for the enforced boundaries.

Local packaging and 22 Docker recovery acceptance groups passed on macOS arm64
with Docker 29.5.2, a linux/arm64 runtime and Node 24.21.0. The same 22 groups
[passed in CI](https://github.com/racedirector/iracing-data-api/actions/runs/37411801261/job/112101646317)
on Ubuntu 24.04.5/Linux amd64, Docker 28.0.4 and Node 24.21.0.
Windows/other architectures are unverified. Windows ACLs do not prove
POSIX modes/ownership; use an environment enforcing that contract rather than
bypassing checks. See [platform and deployment evidence](local-container.md).

## Development, compatibility and rollout

From the repository root with frozen dependencies:

```sh
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
pnpm verify
pnpm verify:docker
```

[Verification](../../docs/VERIFICATION.md) distinguishes service-free verification
from explicit Docker recovery. Normal CI uses synthetic fixtures without accounts;
live upstream evidence is separate and opt-in, following
[upstream contract guidance](../../docs/UPSTREAM-CONTRACT.md). Fixture success does
not establish live completeness. Follow [scoped guidance](AGENTS.md) and the
[composition/lifetime record](architecture.md) before changing ownership.

Application compatibility is owned by the two [tool modules](../../packages/mcp/src/tools)
and [registration](../../packages/mcp/src/register.ts). This is a private app;
independent publication/release policy requires a separate decision.

Rollout stops/drains the current owner, builds the reviewed SHA image, preserves
currently valid credential ownership/modes, then starts exactly one owner. Rollback
stops/drains and restores the prior application/image, discarding all active requests.
Never restore consumed refresh-token backups. If persistence/rotation is uncertain
or the credential document is incompatible, perform stopped host login first.

The optional [MCP ingress authorization contract](remote-authorization.md) is the
resource-server prerequisite for remote deployment. Local defaults remain unchanged;
remote hosting and final network policy are tracked in #443.

The previous `createMcpServices()` compatibility facade and generic
`diagnostics/mapping.ts` have been removed. Use `createMcpCredentialOwner()`
for the local credential lifecycle and `composeMcpServices()` for injected
per-actor query selection.

## Hono listener and protocol

The reference app uses the official MCP TypeScript SDK Hono adapter and
`createMcpHandler`. It serves the two tools with one stateless MCP handler;
there is no custom session registry or Express middleware. The 2025 legacy
fallback is stateless (no `Mcp-Session-Id`), so GET/DELETE session operations
return 405. Hono's bounded request parsing and explicit Host/Origin policy
protect the listener. The app is created using `createMcpRuntime({ config,
dependencies })` and served with `startMcpRuntime(...)`.
