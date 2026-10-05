# iracing-data-mcp

`apps/iracing-data-mcp` is the private MCP application for exposing bounded, agent-oriented iRacing Data API capabilities. It is a sibling protocol adapter over the maintained OAuth client, generated Fetch client, and API schemas; it is not a telemetry application and does not sit on top of another repository application or API router.

## Current boundary

This workspace establishes the application, service and diagnostic seams:

- `McpServices` holds long-lived OAuth and Data API dependencies.
- `createMcpServer()` creates a fresh official-SDK server instance around those shared services.
- `registerMcpTools()` is the request-scoped registration seam for later tool slices.
- `McpApplicationConfigSchema` owns app-local server identity configuration.
- App-local diagnostics define safe error envelopes, mapping seams and JSON stderr logging.

Protected stateless Streamable HTTP and loopback protections are implemented by #350. Durable OAuth/session integration is implemented by #352. The bounded app-local Data API gateway is implemented by #353. The first four projected tools and collection cursors are implemented by #354. Docker packaging (#358) and later tools remain deferred.

## Development

From the repository root:

```bash
pnpm --filter @iracing-data/iracing-data-mcp build
pnpm --filter @iracing-data/iracing-data-mcp test
```

See [scoped guidance](AGENTS.md) and the repository [verification contract](../../docs/VERIFICATION.md) before changing boundaries or dependencies.

## Error and diagnostic contract (#351)

The canonical architecture is the [final #314 synthesis](https://github.com/racedirector/iracing-data-api/issues/314#issuecomment-5986992534). The diagnostic contract comes from #351 / [PR #371](https://github.com/racedirector/iracing-data-api/pull/371), the parent of #350. The #353 gateway and #354 tools use this contract.

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

`createDiagnosticLogger()` emits newline-delimited JSON to stderr by default; its optional writer is for tests. `info`, `error` and `debug` all use the same projection; debug cannot dump an exception. `failure()` derives the stable error code through the safe envelope. Use these boundaries for every future app diagnostic channel; do not send raw errors to console, SDK logging, health or tool text. This contract sanitizes app outputs; it does not intercept process-global/dependency console calls. In particular, the legacy OAuth `DiskStore` logs raw warnings and must not be wired into this app; the session composition uses the durable token-document store.

`healthDiagnostics()` projects only `ready|authorization_required|configuration_error`, defaulting conservatively to configuration error. It makes no upstream request and exposes no exception, file content, account or paths. The HTTP boundary owns the endpoint, liveness and app-version fields; #352 owns the auth-state source.

Support correlates the app request ID with stable error code, safe stage/status/count/timing and auth transitions. Reproduce offline with synthetic data; never ask users to share credential files, raw bodies or stacks. Normal validation is credential-free. Focused tests assert every public code, retry/reason bounds, typed mapping seams, protocol separation, configuration throws and marker absence in structured/text output, diagnostic JSON, health, normal/debug logs and outward messages.

Rollout is app-local contract adoption by later slices; no live service or token migration is introduced. Rollback reverts this slice. Private `0.0.0` app only: no public package version change, regeneration or publishing. Fast local serialization performs bounded projection only and no I/O beyond the logger sink; future transport/gateway latency targets remain owned by those slices.

## Local HTTP transport (#350)

`createHttpApplication({config, services})` is the Node HTTP application entry point. Inject one application-scoped `McpServices` object; every POST creates a fresh official SDK server/transport. `await app.listen()` defaults to `127.0.0.1:3000`. Explicit host overrides are supported; container entrypoints must pass `0.0.0.0` explicitly (`await app.listen(3000, "0.0.0.0")`). The transport does not instantiate OAuth services or read credentials. `createMcpServices()` supplies durable service composition before listening.

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

| Route                                    | Behavior                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /mcp`                              | Official SDK stateless Streamable HTTP, JSON responses; initialize, tools/list and tools/call. The current inventory is empty.                   |
| `GET /mcp`, `DELETE /mcp`, other methods | 405 with `Allow: POST`; no SSE push or session deletion.                                                                                         |
| `GET /healthz`                           | 200 with fixed private app identity/version, `live:true` and allowlisted `auth_state`. Cached local authorization state only; no upstream calls. |
| Other paths                              | 404; no browser OAuth routes or generic RPC routes.                                                                                              |

The pinned official server 2.3.0 and Node adapter 2.1.1 serve Streamable HTTP revisions `2025-11-25`, `2025-06-18` and `2025-03-26`. Initialize negotiates through the SDK: an unknown proposed revision receives the supported `2025-11-25` alternative, which the official client must accept or reject. Unsupported `MCP-Protocol-Version` headers receive 400. The newer SDK's 2026 envelope/subscription mode is outside this v1 endpoint. No MCP session identifiers, event store, legacy HTTP+SSE transport or stdio are installed. Clients must accept both JSON and event-stream media types per the Streamable HTTP contract, although responses here use JSON exclusively. JSON-RPC batches are rejected with 400 to preserve one request-scoped call per exchange.

Limits are fixed application policy, never tool arguments or environment overrides:

- Request body: 64 KiB, counted while reading chunks. Exactly 65,536 bytes are allowed; larger bodies receive 413 immediately without waiting for upload completion. Rejected uploads are paused and the connection closes after the fixed response. Malformed JSON receives 400; no raw body is returned or logged. Incomplete bodies/headers also have a 30-second HTTP timeout.
- Tool calls: at most eight admitted globally, no waiting queue. A ninth call receives the canonical `isError` envelope with `RATE_LIMITED`; retry after active work completes. This is outer application admission, independent of #353's future network-operation limits.
- Tool lifetime: 30 seconds. Deadline expiry returns the safe #351 `INTERNAL_ERROR` envelope with an app request ID, releases admission and closes the request-scoped SDK server to abort its tool context signal. Client disconnect also closes the server and releases capacity. Future tool handlers must honor `ctx.mcpReq.signal` and pass it to cancellable service calls; JavaScript cannot forcibly stop a handler that ignores cancellation. Late results cannot produce a second response. Success and error completion also release capacity.
- Shutdown: SIGTERM/SIGINT stop new requests/admission and drain admitted work for at most ten seconds; remaining SDK work is cancelled and HTTP connections close. `app.shutdown()` is idempotent and directly testable. The timer seam permits deterministic offline tests; importing the library installs no signal handlers.

HTTP/protocol faults stay separate from tool envelopes. SDK JSON-RPC error codes are preserved while free-form messages/data are projected to fixed safe text. SDK tool-error text is replaced by the #351 envelope; canonical application failures retain their code/recovery metadata and receive the current application request ID. New transport logs use the #351 allowlist exclusively. `/healthz` reads the cached authorization state from the shared services; legacy injected services without that source retain the conservative `configuration_error` fallback. Liveness remains 200 regardless of authorization.

### Local threat model and rollout

The server trusts local OS processes, which may exercise the eventual authenticated iRacing account. Host/Origin checks reduce browser and DNS-rebinding exposure; they do not authenticate users. The MCP server has no bearer authentication: an Authorization header is ignored, including an iRacing OAuth token, and cannot bypass Host/Origin checks. iRacing credentials authorize only iRacing requests. Browser login routes, MCP token schemes, telemetry and Docker packaging remain deferred. Gateway reads and the four tools below use the existing OAuth owner.

Rollout is private application composition on the parent stack, followed by #352/#353 and tool slices. Rollback reverts this transport slice and stops its listener; it introduces no credential migration. The private app stays `0.0.0`; no public package release or generated contract/client changes are required. Fast local protocol/health operations target less than one second; upstream latency depends on iRacing and is bounded by the gateway deadlines below.

## Durable OAuth ownership (#352)

Compose once before listening and share the returned services with all request-scoped servers:

```ts
const services = await createMcpServices({
  clientMetadata: {
    clientId: configuredClientId,
    clientSecret: configuredOptionalSecret,
    redirectUri: registeredRedirectUri,
    scopes: ["iracing.auth"],
  },
  // Host development uses the CLI's dedicated auth-only file:
  credentialFile: ".iracing-data/iracing-data-mcp/credentials.json",
});
const app = createHttpApplication({
  config: parseMcpApplicationConfig(),
  services,
});
const removeSignalHandlers = installTerminationHandlers(app);
await app.listen();
```

The default credential file is `/var/lib/iracing-data-mcp/credentials.json`; the canonical local session key is `iracing-data-mcp-local`. Select the same dedicated file in the host CLI and service composition. Client metadata uses the existing OAuth package schema; invalid configuration produces the fixed `CONFIGURATION_ERROR` recovery. It requires the registered redirect URI for schema compatibility; the MCP app does not receive callbacks. Browser state storage rejects authorization creation. Neither tokens nor secrets belong in command arguments or diagnostics.

The existing `OAuthTokenDocumentSessionStore` owns secure bare JSON reading, modes/ownership/symlink/size checks, serialized atomic durable writes and deletion. Required directory durability is used; unsupported platforms/filesystems fail closed. A refresh token and explicit `iracing.auth` scope are required. Additional scope does not grant any additional MCP capability. Expired access tokens are accepted for lazy restoration. Startup reads the document once without network; it does not verify account entitlement. Health reads cached local readiness, including expired but refreshable sessions, rather than claiming upstream availability. Initialize and listing remain available without credentials.

The generated Fetch configuration obtains its access token asynchronously through the one long-lived OAuth client's `restoreSessionForId()`. Per-session single-flight covers refresh and durable publication. Replacement-token omission retains the OAuth client's existing merge semantics; the app does not invent rotation behavior. A replacement scope that removes `iracing.auth` fails closed. There is no automatic refresh retry. An explicit structured OAuth `temporarily_unavailable` or `server_error` rejection exposed by the pinned OAuth dependency permits a subsequent caller to retry (`transient_refresh`). Network loss, malformed success, unstructured rejection, and 5xx responses that the dependency does not establish as structured nonconsumption are `rotation_uncertain`. `invalid_grant` is `revoked_authorization`; a failed durable replacement write is `persistence_failed`.

Uncertain consumption, revocation, or failed persistence quarantines the process before another caller can refresh. The app attempts secure durable deletion through the existing store API so restart cannot normally reuse the old credential. If filesystem failure also prevents deletion, the process remains quarantined: **repair the filesystem and replace the file using stopped login before restarting**. A crash before deletion likewise requires stopped reauthentication; successful deletion cannot be guaranteed on a failed filesystem. No old credential backup is a recovery mechanism.

Supported recovery and ownership:

1. Stop/drain the MCP application (`await app.shutdown()` or SIGTERM/SIGINT) and wait for the owner process to exit. A tool cancellation does not cancel the shared refresh grant; let it persist/drain, or reauthenticate after a forced termination with uncertain consumption.
2. Run host login against exactly the selected file. From the repository root, the development default is `pnpm run iracing-data auth login --scope iracing.auth`; an explicit destination is `pnpm run iracing-data auth login --scope iracing.auth --credentials <same-file>`.
3. Restart the MCP application to load the replacement. A running owner never hot reloads externally changed/deleted credentials.

For local logout, stop/drain and exit first, delete the selected credential file locally, then restart if desired. This is local deletion, not upstream revocation. Do not run CLI refresh/authenticated commands concurrently against the server-owned credential, copy a rotating credential, restore an older backup, or run multiple replicas against one file. This local singleton model has no credential watcher, distributed lock, hosted authentication or MCP browser login.

Offline tests use private temporary files and synthetic grants to cover bootstrap, required scope/refresh, expiry, concurrency, rotation/restart, missing/corrupt/unsafe/unreadable/unsupported state, transient/revoked/ambiguous grants, persistence failure, quarantine, stopped login/logout, health/protocol availability and redaction. Existing HTTP/security and diagnostic leakage tests remain active. No public package version, generated artifact, release or publication changes are required. Rollout composes this private service with #350; rollback stops the process and reverts the app delta, using fresh login if token consumption is uncertain.

## Bounded Data API gateway (#353)

`createMcpServices()` composes one `dataApiGateway` beside the existing OAuth owner. Later tool handlers must compose every upstream operation for one tool invocation inside `withCall`, passing the SDK cancellation signal. This is an app-local service, not a public generic gateway or an arbitrary URL proxy. Health, initialize and listing do not invoke it.

```ts
const pageSource = await services.dataApiGateway!.withCall(
  async (call) => ({
    items: await call.cars(),
    expiresAt: call.expiresAt,
  }),
  toolAbortSignal,
);
// #354 validates/projects collection items and owns opaque cursors.
```

`GatewayCall` exposes only the planned read operations: document, categories constants, member, drivers, cars, tracks, recent races, season list/schedule, results and series search. Inputs use the maintained wire schemas; tool slices must apply their stricter noncoercing input schemas and bounded projections. Direct documents/constants are parsed with canonical schemas; link operations require a valid link envelope and the operation's observed collection/object shape. These raw internal payloads must never be forwarded directly to a model. Detailed field validation/projection belongs to each tool slice.

The generated Fetch client builds authenticated requests through a bounded custom fetch. Only `https://members-ng.iracing.com` receives its asynchronous bearer token. Configuration middleware, cookies, credentials and unrelated headers are discarded. Cache requests create fresh unauthenticated headers. Both paths reject redirects before reading or resolving anything else.

Cache destinations are exactly the evidence-backed HTTPS hosts `scorpio-assets.s3.us-east-1.amazonaws.com` and `scorpio-assets.s3.amazonaws.com` from the [architecture synthesis](https://github.com/racedirector/iracing-data-api/issues/314#issuecomment-5986992534). Userinfo, fragments, unsafe ports, whitespace/backslashes, traversal and ambiguous encoded path escapes fail closed. Manifest bases must be directories without query overrides; chunks are simple filenames under that same directory. Every connection resolves all DNS answers, rejects nonpublic/mapped/transition addresses, and pins a validated address in the TLS lookup callback while retaining hostname certificate verification. There is no redirect follower, proxy agent, cookie jar or host wildcard. A new legitimate host requires reviewed evidence and an allowlist change.

Fixed limits cannot be raised through tool input:

| Bound                                                   | Limit                             |
| ------------------------------------------------------- | --------------------------------- |
| Decoded/decompressed bytes per response                 | 8 MiB                             |
| Cumulative bytes per call, including cached chunk reads | 16 MiB                            |
| API/cache fetches per call                              | 8                                 |
| One fetch, through body completion                      | 10 seconds                        |
| One call, including authorization wait                  | 30 seconds                        |
| Global API/cache network operations                     | 2                                 |
| Admitted gateway calls                                  | 8 (HTTP tool admission remains 8) |
| Retained search states / manifest and chunk bytes       | 32 / 32 MiB                       |
| Internal search lifetime                                | 5 minutes                         |

Streaming enforces decoded sizes regardless of missing/deceptive Content-Length; production transport decodes gzip, deflate and Brotli first. Capacity is rejected promptly without a queue. Identical in-flight fetches share work inside the singleton owner, charge each caller's own fetch/byte budget, and stop when the last caller cancels. One canceled caller cannot abort another's download. No response cache survives a call except bounded search-local chunks. Authorization loss invalidates retained searches; process restart also invalidates every handle. Cancellation/deadline can stop Data API/cache work; it never retries or aborts an ambiguously consumed OAuth refresh grant.

Search consumes the bounded raw response of the generated `getResultsSearchSeriesRaw` method and validates it with `ResultsSearchSeriesResponseSchema`. Live reconciliation found that merged #348 added this schema but did **not** update the public OpenAPI mapping/generated decoder: this parent still decodes `.value()` as a link. The gateway therefore uses `.raw` JSON and never casts a manifest to a link. That public mapping/regeneration/release correction is separate from #353; no generated files are edited here.

Manifest validation requires successful search, matching/unique filenames, consistent chunk/row counts, at most 1,000 files/500,000 rows and safe paths. `call.search()` returns an internal handle containing totals and policy expiry, with signed URLs held privately. `call.chunk(handle, index)` retrieves only the selected file, validates its expected row count, preserves file/row order, and replays a private cached copy. It never aggregates a search. Example for a later search tool:

```ts
const source = await gateway.withCall(async (call) => {
  const search = await call.search(validatedSearchParameters);
  const rows = search.chunks ? await call.chunk(search, 0) : [];
  return { search, rows };
}, toolAbortSignal);
// #357 owns model-facing opaque cursors, offsets, filtering and page projections.
```

Known link expiry contributes to `call.expiresAt`: the earlier of five minutes and envelope expiry minus 30 seconds. This supports #354's collection cursor lifetime without exposing signed links. Search has no observed envelope expiry, so its five-minute limit is app policy. Elapsed expiry and cache 403/404 yield `CURSOR_EXPIRED`. Only a first-page linked operation may reacquire its envelope once, within all original caps; a continuation never rematerializes a search. No other API/cache/OAuth retry loop exists.

429 establishes a shared cooldown from bounded Retry-After seconds or HTTP date (up to one hour; invalid/absent values use one second). New work returns `RATE_LIMITED` immediately with safe retry metadata. API 401/403 remain `UPSTREAM_UNAUTHORIZED`, without refresh/retry loops. Unsafe links/malformed data are `DATA_RESOLUTION_FAILED`; oversized sources are `RESPONSE_LIMIT_EXCEEDED`; timeout/cancellation/network failure is `UPSTREAM_UNAVAILABLE`. Narrow oversized requests, wait for cooldown, rerun expired searches, or give support the app request ID. Raw URLs, headers, bodies and exception causes are excluded from fixed errors and allowlisted diagnostics.

Offline gateway tests cover operation shapes, both cache hosts, expiry/reacquisition, manifest/path/DNS attacks, decoded and cumulative caps, compression, cancellation/deadlines, admission/concurrency, deduplication, retention, account-local invalidation and safe diagnostics. Existing session/quarantine/rotation and HTTP/security tests remain active. No domain tools, model-facing cursors, Docker/Compose, telemetry, hosted auth, callbacks, public package versions or publication are added. Rollout uses the shared services before listening; rollback stops/drains and reverts this private slice. Never restore consumed refresh credentials; use stopped host login when rotation is uncertain.

## Identity, recent races and content tools (#354)

The four read-only tools require only the existing `iracing.auth` session. Tokens
are never arguments. Health, initialize and tool listing remain available before
login. Inputs reject unknown fields, numeric strings and changes to continuation
filters. IDs must be positive safe integers. Names and labels are untrusted data.

| Tool               | Initial arguments                                                  | Result                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_my_driver`    | `{}`                                                               | `cust_id`, `display_name` from Data API `member/info`                                                                                                                                             |
| `find_drivers`     | `query` (trimmed, 2–100 characters), optional `league_id`, `limit` | Driver IDs/names in upstream rank order; `ambiguous` means multiple source matches, including when the current page has one row. No driver is selected automatically.                             |
| `get_recent_races` | Optional `cust_id`, `limit` (1–10, default 10)                     | `cust_id`, `races`, `returned_count`, `complete:true`, `position_basis:"upstream"`. This is the upstream recent window, not exhaustive history. Positions, including sentinels, remain unchanged. |
| `lookup_content`   | `kind` (`"cars"` or `"tracks"`), optional unique `ids` (1–50) **or** `query` (2–100 characters), optional `limit` | Cars: ID/name/abbreviation. Tracks: ID/name/config/category/oval/dirt. Case-insensitive substring matching on names/config; ascending ID order. ID requests include sorted `missing_ids`. Neither IDs nor query means browse. |

Collection tools default to 25 items, accept `limit` 1–100, and return
`items`, `returned_count`, `complete`, `next_cursor` and `source_total` (the
matching collection size). Content pages include `kind`; ID pages retain the same
`missing_ids` across continuation. Every complete tool result is at most 64 KiB,
counting both structured JSON and the equivalent text. Page size shrinks to fit
bytes; a single item that cannot fit fails with `RESPONSE_LIMIT_EXCEEDED`.
Recent results do not have a cursor; their `complete` describes the requested
recent window only. Optional unavailable fields become `null`, never invented
zeros. Malformed essential fields fail with `DATA_RESOLUTION_FAILED`.

Example official MCP client calls, after the host CLI login and server restart:

```ts
const self = await client.callTool({ name: "get_my_driver", arguments: {} });
const recent = await client.callTool({
  name: "get_recent_races",
  arguments: { cust_id: self.structuredContent!.cust_id, limit: 5 },
});
const drivers = await client.callTool({
  name: "find_drivers",
  arguments: { query: "Synthetic Driver", limit: 25 },
});
// Inspect candidates; ask the user to disambiguate rather than picking a match.
const tracks = await client.callTool({
  name: "lookup_content",
  arguments: { kind: "tracks", query: "Watkins Glen", limit: 25 },
});
const cars = await client.callTool({
  name: "lookup_content",
  arguments: { kind: "cars", ids: [101, 102], limit: 25 },
});
if (tracks.structuredContent!.next_cursor) {
  const next = await client.callTool({
    name: "lookup_content",
    arguments: { cursor: tracks.structuredContent!.next_cursor },
  });
}
```

A continuation accepts `{cursor}` alone. Opaque 256-bit random tokens refer to
private immutable projected collections, normalized filters, tool, account-owner
generation, page limit and offset. Replaying one returns the same page and next
token, including concurrent calls; it performs authorization restoration inside
`withCall` but no Data API/cache request. Upstream reads for one tool share one
cancelable gateway budget. Cursors expire at the earlier of five minutes and the
gateway's earliest known envelope expiry minus thirty seconds. No page resets the
expiry. Restart, authorization loss or gateway/account-owner invalidation retires
them. At most 32 tokens and 32 MiB of serialized projected state/replay results are
retained; capacity fails promptly, without eviction/restart mixing. Cursors are
never persisted and carry no signed URL or credential.

Recovery: correct `INVALID_INPUT` arguments; rerun an initial query after
`CURSOR_EXPIRED`; lower the page size or narrow a query after
`RESPONSE_LIMIT_EXCEEDED`. A source over the gateway byte cap still fails before
projection, so lowering the page size cannot fix an oversized source. Authorization
and refresh recovery remains the stopped-login workflow above; uncertain refresh
consumption is never retried. Source account details, ownership, liveries, assets,
prices and URLs are excluded. Synthetic integration tests cover identity/recent
performance, driver ambiguity and content resolution; live upstream completeness
is not claimed.

This private `0.0.0` slice needs no public package version bump or generated
contract change. Rollout adds these registrations to the existing shared services;
local protocol/cursor replay targets less than one second, while upstream calls
retain the gateway deadlines. Rollback stops/drains and reverts this slice, losing
all cursors; never restore consumed refresh credentials. Series/schedule, detailed
results, history search, Docker/Compose, telemetry, hosted auth, browser callbacks,
resources/prompts and arbitrary proxying remain separate slices.
