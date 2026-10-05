# iracing-data-mcp

`apps/iracing-data-mcp` is the private MCP application for exposing bounded, agent-oriented iRacing Data API capabilities. It is a sibling protocol adapter over the maintained OAuth client, generated Fetch client, and API schemas; it is not a telemetry application and does not sit on top of another repository application or API router.

## Current boundary

This workspace establishes the application, service and diagnostic seams:

- `McpServices` holds long-lived OAuth and Data API dependencies.
- `createMcpServer()` creates a fresh official-SDK server instance around those shared services.
- `registerMcpTools()` is the request-scoped registration seam for later tool slices.
- `McpApplicationConfigSchema` owns app-local server identity configuration.
- App-local diagnostics define safe error envelopes, mapping seams and JSON stderr logging.

Streamable HTTP handling, loopback protections, OAuth/session integration, Data API gateway behavior, Docker packaging, and concrete tools are intentionally implemented by later issues in the MCP backlog.

## Development

From the repository root:

```bash
pnpm --filter @iracing-data/iracing-data-mcp build
pnpm --filter @iracing-data/iracing-data-mcp test
```

See [scoped guidance](AGENTS.md) and the repository [verification contract](../../docs/VERIFICATION.md) before changing boundaries or dependencies.

## Error and diagnostic contract (#351)

The canonical architecture is the [final #314 synthesis](https://github.com/racedirector/iracing-data-api/issues/314#issuecomment-5986992534). This slice follows #349 / [PR #370](https://github.com/racedirector/iracing-data-api/pull/370) and precedes #350 transport, #352 durable sessions and #353 gateway. It adds no routes, OAuth execution, cache resolution or domain tools.

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

`mapFailure()` separates `http`, `mcp_protocol`, `tool`, `oauth_session`, `upstream`, `configuration` and `internal` domains. HTTP/protocol faults produce a safe `ProtocolFailure` discriminator, and `toolError()` rejects them. #350 owns their actual HTTP statuses and SDK JSON-RPC responses, malformed requests and unknown tool handling. This seam does not catch/serialize SDK protocol exceptions. OAuth mapping recognizes existing client errors and requires explicit context for ambiguous rotation/persistence. An upstream 401/403 alone is access denial; the gateway must explicitly confirm entitlement denial before supplying `upstreamAuthorization: "account_entitlement"`. Upstream mapping recognizes the generated Fetch runtime's errors, including its ES5 Error-subclass prototype behavior, without changing generated code or reading response bodies. Future gateway/session slices supply typed application failures for unsafe links, limits, cursor expiry and absent data.

### Central redaction and support diagnostics

Redaction uses **projection**, not a best-effort token regex: arbitrary strings, exception objects, messages, nested causes, raw OAuth/upstream bodies and unknown fields are discarded entirely. `redactDiagnostics()` reads only allowlisted own data properties and never invokes nested serializers/getters. Fixed enums admit operations, planned tool names, lifecycle stages and safe auth transitions; bounded numbers admit timing, status, bytes, items and retry attempts. New diagnostic fields require a schema change and leakage tests. Credentials, JWT claims, customer/member IDs/names, authorization codes, PKCE/state, headers/cookies, credential documents, signed URLs/query strings, secret-bearing paths and stacks have no permitted output field. No identity exception is permitted in diagnostics.

`createDiagnosticLogger()` emits newline-delimited JSON to stderr by default; its optional writer is for tests. `info`, `error` and `debug` all use the same projection; debug cannot dump an exception. `failure()` derives the stable error code through the safe envelope. Use these boundaries for every future app diagnostic channel; do not send raw errors to console, SDK logging, health or tool text. This contract sanitizes app outputs; it does not intercept process-global/dependency console calls. In particular, the legacy OAuth `DiskStore` logs raw warnings and must not be wired into this app; #352 owns selecting the durable token-document store.

`healthDiagnostics()` projects only `ready|authorization_required|configuration_error`, defaulting conservatively to configuration error. It makes no upstream request and exposes no exception, file content, account or paths. #350 owns the endpoint, liveness and app-version fields; #352 owns the auth-state source.

Support correlates the app request ID with stable error code, safe stage/status/count/timing and auth transitions. Reproduce offline with synthetic data; never ask users to share credential files, raw bodies or stacks. Normal validation is credential-free. Focused tests assert every public code, retry/reason bounds, typed mapping seams, protocol separation, configuration throws and marker absence in structured/text output, diagnostic JSON, health, normal/debug logs and outward messages.

Rollout is app-local contract adoption by later slices; no live service or token migration is introduced. Rollback reverts this slice. Private `0.0.0` app only: no public package version change, regeneration or publishing. Fast local serialization performs bounded projection only and no I/O beyond the logger sink; future transport/gateway latency targets remain owned by those slices.
