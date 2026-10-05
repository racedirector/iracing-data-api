# iracing-data-mcp

`apps/iracing-data-mcp` is the private MCP application for exposing bounded, agent-oriented iRacing Data API capabilities. It is a sibling protocol adapter over the maintained OAuth client, generated Fetch client, and API schemas; it is not a telemetry application and does not sit on top of another repository application or API router.

## Current boundary

This workspace establishes the application, service and diagnostic seams:

- `McpServices` holds long-lived OAuth and Data API dependencies.
- `createMcpServer()` creates a fresh official-SDK server instance around those shared services.
- `registerMcpTools()` is the request-scoped registration seam for later tool slices.
- `McpApplicationConfigSchema` owns app-local server identity configuration.
- App-local diagnostics define safe error envelopes, mapping seams and JSON stderr logging.

Protected stateless Streamable HTTP and loopback protections are implemented by #350. OAuth/session integration (#352), Data API gateway behavior (#353), Docker packaging (#358), and concrete tools remain deferred.

## Development

From the repository root:

```bash
pnpm --filter @iracing-data/iracing-data-mcp build
pnpm --filter @iracing-data/iracing-data-mcp test
```

See [scoped guidance](AGENTS.md) and the repository [verification contract](../../docs/VERIFICATION.md) before changing boundaries or dependencies.

## Error and diagnostic contract (#351)

The canonical architecture is the [final #314 synthesis](https://github.com/racedirector/iracing-data-api/issues/314#issuecomment-5986992534). The diagnostic contract comes from #351 / [PR #371](https://github.com/racedirector/iracing-data-api/pull/371), the parent of #350. Durable sessions (#352), gateway (#353), cache resolution and domain tools remain deferred.

Create one `createRequestContext()` at the application request boundary; reuse it for output and logs. Client, JSON-RPC and upstream IDs are never used as diagnostic IDs. `ApplicationFailure` accepts a code and bounded optional metadata, never a message/cause. `toolError()` returns `isError: true`, `structuredContent: { error: { code, message, retryable, request_id, reason?, retry_after_seconds? } }` and one JSON text equivalent. `ErrorEnvelopeSchema` strictly validates the envelope and code-specific policy. Unknown exceptions become `INTERNAL_ERROR`; messages come only from fixed app recovery text.

```ts
const context = createRequestContext();
const failure = new ApplicationFailure("RATE_LIMITED", {
  retry_after_seconds: 30,
});
logger.failure(context, failure, { operation: "data_api", status: 429 });
return toolError(failure, context);
```

| Code                      | Recovery / retry policy                                                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INVALID_INPUT`           | Correct input; non-retryable until changed.                                                                                                                                             |
| `AUTHORIZATION_REQUIRED`  | Stop app, run host `iracing-data auth login --scope iracing.auth`, restart. Missing/revoked/invalid/insufficient-scope/unpersisted sessions stay distinct through bounded reasons.      |
| `TOKEN_REFRESH_FAILED`    | Retryable only with explicit `safe_to_retry` lifecycle evidence (`transient_refresh`). Unknown grant consumption or rotation is `rotation_uncertain`, non-retryable; stop and re-login. |
| `UPSTREAM_UNAUTHORIZED`   | Valid-session API 401/403: inspect account access/entitlement; no refresh loop.                                                                                                         |
| `RATE_LIMITED`            | Retry later; optional delta seconds.                                                                                                                                                    |
| `UPSTREAM_UNAVAILABLE`    | Network/timeout/5xx; bounded later retry.                                                                                                                                               |
| `DATA_RESOLUTION_FAILED`  | Invalid data or unsafe link; request ID for support, no body.                                                                                                                           |
| `RESPONSE_LIMIT_EXCEEDED` | Narrow query/source; smaller projected pages alone may not repair an oversized source.                                                                                                  |
| `CURSOR_EXPIRED`          | Restart the initial search; never retry the expired cursor.                                                                                                                             |
| `NOT_FOUND`               | Check identifiers; distinct from parsing/resolution failure.                                                                                                                            |
| `CONFIGURATION_ERROR`     | Repair local configuration/credential mount and restart.                                                                                                                                |
| `INTERNAL_ERROR`          | Request ID for support.                                                                                                                                                                 |

Retry hints are finite, nonnegative integers capped at 3,600 seconds; non-retryable errors omit them. No automated retry/sleep is implemented. Reasons are code-specific fixed literals, never upstream text. HTTP-date Retry-After interpretation belongs to #353. Refresh outcome must be supplied by the session owner from lifecycle evidence; status/message matching alone cannot prove a consumed refresh token is safe to retry. Persistence after a replacement maps to authorization required with `persistence_failed`; never restore an old consumed token as rollback.

`mapFailure()` separates `http`, `mcp_protocol`, `tool`, `oauth_session`, `upstream`, `configuration` and `internal` domains. HTTP/protocol faults produce a safe `ProtocolFailure` discriminator, and `toolError()` rejects them. The HTTP boundary supplies their actual HTTP statuses and SDK JSON-RPC responses, malformed requests and unknown tool handling. This seam does not catch/serialize SDK protocol exceptions. OAuth mapping recognizes existing client errors (the wrapped oauth4webapi library code is distinct from the OAuth `invalid_grant` identifier; only the retained own `cause.error` discriminator is inspected, never the body or description) and requires explicit context for ambiguous rotation/persistence. An upstream 401/403 alone is access denial; the gateway must explicitly confirm entitlement denial before supplying `upstreamAuthorization: "account_entitlement"`. Upstream mapping recognizes the generated Fetch runtime's errors, including its ES5 Error-subclass prototype behavior, without changing generated code or reading response bodies. Future gateway/session slices supply typed application failures for unsafe links, limits, cursor expiry and absent data.

### Central redaction and support diagnostics

Redaction uses **projection**, not a best-effort token regex: arbitrary strings, exception objects, messages, nested causes, raw OAuth/upstream bodies and unknown fields are discarded entirely. `redactDiagnostics()` reads only allowlisted own data properties and never invokes nested serializers/getters. Fixed enums admit operations, planned tool names, lifecycle stages and safe auth transitions; bounded numbers admit timing, status, bytes, items and retry attempts. New diagnostic fields require a schema change and leakage tests. Credentials, JWT claims, customer/member IDs/names, authorization codes, PKCE/state, headers/cookies, credential documents, signed URLs/query strings, secret-bearing paths and stacks have no permitted output field. No identity exception is permitted in diagnostics.

`createDiagnosticLogger()` emits newline-delimited JSON to stderr by default; its optional writer is for tests. `info`, `error` and `debug` all use the same projection; debug cannot dump an exception. `failure()` derives the stable error code through the safe envelope. Use these boundaries for every future app diagnostic channel; do not send raw errors to console, SDK logging, health or tool text. This contract sanitizes app outputs; it does not intercept process-global/dependency console calls. In particular, the legacy OAuth `DiskStore` logs raw warnings and must not be wired into this app; #352 owns selecting the durable token-document store.

`healthDiagnostics()` projects only `ready|authorization_required|configuration_error`, defaulting conservatively to configuration error. It makes no upstream request and exposes no exception, file content, account or paths. The HTTP boundary owns the endpoint, liveness and app-version fields; #352 owns the auth-state source.

Support correlates the app request ID with stable error code, safe stage/status/count/timing and auth transitions. Reproduce offline with synthetic data; never ask users to share credential files, raw bodies or stacks. Normal validation is credential-free. Focused tests assert every public code, retry/reason bounds, typed mapping seams, protocol separation, configuration throws and marker absence in structured/text output, diagnostic JSON, health, normal/debug logs and outward messages.

Rollout is app-local contract adoption by later slices; no live service or token migration is introduced. Rollback reverts this slice. Private `0.0.0` app only: no public package version change, regeneration or publishing. Fast local serialization performs bounded projection only and no I/O beyond the logger sink; future transport/gateway latency targets remain owned by those slices.

## Local HTTP transport (#350)

`createHttpApplication({config, services})` is the Node HTTP application entry point. Inject one application-scoped `McpServices` object; every POST creates a fresh official SDK server/transport. `await app.listen()` listens on `0.0.0.0:3000`. The transport does not instantiate OAuth services or read credentials. Later #352 supplies real durable service composition; this slice exposes the injectable entry point without inventing a token store or standalone login command.

```ts
const app = createHttpApplication({
  config: parseMcpApplicationConfig(),
  services, // existing application-scoped McpServices
});
const removeSignalHandlers = installTerminationHandlers(app);
await app.listen();
// Programmatic shutdown is also supported:
await app.shutdown();
removeSignalHandlers();
```

Supported endpoint: `http://127.0.0.1:3000/mcp`. The deployment contract publishes the host port only as `127.0.0.1:3000:3000`; Docker/Compose packaging is deferred to #358. Listening on all container interfaces does not authorize LAN/public publication. There is no LAN, public, reverse-proxy or multi-user deployment support.

All routes accept only exact Host authorities `127.0.0.1:3000` and `localhost:3000`. Duplicate Host headers and every other authority are rejected with HTTP 403 before MCP handling. Forwarded and X-Forwarded-Host headers are ignored. Missing Origin is valid for native clients. A present Origin must be exactly `http://127.0.0.1:3000` or `http://localhost:3000`; null, malformed, HTTPS, wrong ports, userinfo, paths and deceptive hosts receive 403. No CORS headers or wildcard matching are added.

| Route                                    | Behavior                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `POST /mcp`                              | Official SDK stateless Streamable HTTP, JSON responses; initialize, tools/list and tools/call. The current inventory is empty. |
| `GET /mcp`, `DELETE /mcp`, other methods | 405 with `Allow: POST`; no SSE push or session deletion.                                                                       |
| `GET /healthz`                           | 200 with fixed private app identity/version, `live:true` and allowlisted `auth_state`. No service access or upstream calls.    |
| Other paths                              | 404; no browser OAuth routes or generic RPC routes.                                                                            |

The pinned official server 2.3.0 and Node adapter 2.1.1 serve Streamable HTTP revisions `2025-11-25`, `2025-06-18` and `2025-03-26`. Initialize negotiates through the SDK: an unknown proposed revision receives the supported `2025-11-25` alternative, which the official client must accept or reject. Unsupported `MCP-Protocol-Version` headers receive 400. The newer SDK's 2026 envelope/subscription mode is outside this v1 endpoint. No MCP session identifiers, event store, legacy HTTP+SSE transport or stdio are installed. Clients must accept both JSON and event-stream media types per the Streamable HTTP contract, although responses here use JSON exclusively. JSON-RPC batches are rejected with 400 to preserve one request-scoped call per exchange.

Limits are fixed application policy, never tool arguments or environment overrides:

- Request body: 64 KiB, counted while reading chunks. Exactly 65,536 bytes are allowed; larger bodies receive 413 immediately without waiting for upload completion. Rejected uploads are paused and the connection closes after the fixed response. Malformed JSON receives 400; no raw body is returned or logged. Incomplete bodies/headers also have a 30-second HTTP timeout.
- Tool calls: at most eight admitted globally, no waiting queue. A ninth call receives the canonical `isError` envelope with `RATE_LIMITED`; retry after active work completes. This is outer application admission, independent of #353's future network-operation limits.
- Tool lifetime: 30 seconds. Deadline expiry returns the safe #351 `INTERNAL_ERROR` envelope with an app request ID, releases admission and closes the request-scoped SDK server to abort its tool context signal. Client disconnect also closes the server and releases capacity. Future tool handlers must honor `ctx.mcpReq.signal` and pass it to cancellable service calls; JavaScript cannot forcibly stop a handler that ignores cancellation. Late results cannot produce a second response. Success and error completion also release capacity.
- Shutdown: SIGTERM/SIGINT stop new requests/admission and drain admitted work for at most ten seconds; remaining SDK work is cancelled and HTTP connections close. `app.shutdown()` is idempotent and directly testable. The timer seam permits deterministic offline tests; importing the library installs no signal handlers.

HTTP/protocol faults stay separate from tool envelopes. SDK JSON-RPC error codes are preserved while free-form messages/data are projected to fixed safe text. SDK tool-error text is replaced by the #351 envelope; canonical application failures retain their code/recovery metadata and receive the current application request ID. New transport logs use the #351 allowlist exclusively. `/healthz` defaults to `configuration_error` because #352's durable auth-state source is unavailable; liveness remains 200 and no authorization readiness is claimed.

### Local threat model and rollout

The server trusts local OS processes, which may exercise the eventual authenticated iRacing account. Host/Origin checks reduce browser and DNS-rebinding exposure; they do not authenticate users. The MCP server has no bearer authentication: an Authorization header is ignored, including an iRacing OAuth token, and cannot bypass Host/Origin checks. iRacing credentials authorize only iRacing requests. Browser login routes, MCP token schemes, durable session wiring, gateway fetching/retries, domain tools, telemetry and Docker packaging are absent.

Rollout is private application composition on the parent stack, followed by #352/#353 and tool slices. Rollback reverts this transport slice and stops its listener; it introduces no credential migration. The private app stays `0.0.0`; no public package release or generated contract/client changes are required. Fast local protocol/health operations target less than one second; upstream latency is not implemented or claimed here.
