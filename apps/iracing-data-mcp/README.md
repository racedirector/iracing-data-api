# Local iRacing Data API MCP

This private application exposes eight bounded, read-only tools over the maintained
Data API schemas, generated Fetch client and OAuth client. Run one local Docker
container and connect an MCP client on the same machine. It supports Data API
queries with `iracing.auth`; it provides no telemetry, profile lookup, arbitrary
API proxy, writes, unbounded history or hosted multi-user service.

## Set up and connect

Follow the [local container guide](local-container.md) for the exact frozen build,
Compose commands, host CLI login, credential directory and optional secret file.
Login requests `iracing.auth` and uses the same registered client ID as the
container. The host CLI owns browser authorization; the container has no browser
OAuth routes. Auth-only credentials cannot use the CLI's profile-based `whoami`.

After starting the container, connect Codex on the same machine:

```sh
codex mcp add iracing-data --url http://127.0.0.1:3000/mcp
```

This syntax was checked against installed Codex CLI 0.160.0. Automated tests use
the official MCP client over local Streamable HTTP with synthetic data; native
desktop UI and live iRacing access were not exercised by those tests. Registration
alone does not establish valid iRacing authorization. Other local clients must
support Streamable HTTP at this URL. The supported protocol versions are
`2025-11-25`, `2025-06-18` and `2025-03-26`; stdio is unsupported.

`GET /healthz`, initialization and tool listing remain available when credentials
are missing or corrupt. Health reports liveness and authorization state, not proof
that an upstream API operation will succeed. Authenticated tool calls require a
valid durable credential document.

## Tool inputs and results

All inputs are strict: unknown keys, numeric strings and cursor/filter mixtures
are rejected. IDs are positive safe integers. Paged tools accept `limit` 1–100,
default 25; recent races instead accept 1–10, default 10. Continue paged tools with
`{"cursor":"returned-token"}` alone, retaining the initial page size and filters.
Success returns `structuredContent` and equivalent JSON text; the complete
serialized result, including both copies, must fit 64 KiB. Only allowlisted fields
are returned; unavailable optional projected fields are `null`.

| Tool                  | Initial arguments                                                                                    | Meaning and bounds                                                                                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_my_driver`       | `{}`                                                                                                 | Authenticated customer ID and display name from member/info; no profile scope or full profile.                                                                                                                                                             |
| `find_drivers`        | `query` (2–100 trimmed characters), optional `league_id`, `limit`                                    | Driver IDs/names in upstream ranking order. `ambiguous` is true for multiple matches; no driver is automatically chosen.                                                                                                                                   |
| `get_recent_races`    | Optional `cust_id`, `limit`                                                                          | Defaults to the authenticated customer; at most ten upstream recent races, no continuation. Positions retain source values and `position_basis:"upstream"`, including negative sentinels.                                                                  |
| `lookup_content`      | `kind:"cars"` or `"tracks"`; optional unique `ids` (1–50) **or** `query`; `limit`                    | Car/track/configuration identity, ascending IDs; requested unavailable IDs appear in `missing_ids`. Name/configuration matches may need human selection.                                                                                                   |
| `list_series_seasons` | Optional `series_id`, paired `season_year` + `season_quarter`, `limit`                               | Omitted period preserves upstream active-season default. Historical year is 2000–2100, quarter 1–4. Series filtering is local; rows sort by season ID.                                                                                                     |
| `get_series_schedule` | `season_id`, optional `race_week_num` (0–52), `limit`                                                | Local week filtering; week **0 is the first week**. Calendar `start_date` is preserved; `week_end_time` is normalized to UTC. Deterministic week/date/series/track/config order, without recurrence interpretation.                                        |
| `get_race_result`     | `subsession_id`, optional unique `cust_ids` (1–10), `simsession_number` (-20–20, default 0), `limit` | Selected session participants in source order with race context. Nonnegative positions add one; negative sentinels become null; `position_basis:"one_based"`. Missing simsession is `NOT_FOUND`.                                                           |
| `search_driver_races` | `range`; optional `cust_id`, `series_id`, unique `track_ids` (1–50), `official_only`, `limit`        | One customer's race summaries, default self; event type forced to 5. `range` is exactly `{start,start_end}` with ordered UTC timestamps, start inclusive/end exclusive and duration ≤90 days, or `{season_year,season_quarter}`. Track filtering is local. |

Race results expose customer/team identity, name, car/class, grid/finish/class
finish, completed laps, incidents, championship points, old/new iRating and reason
out. Individual rows have `attribution:"driver"`; team rows have
`attribution:"team"`. A customer filter selects nested team-driver rows with their
team ID and their own outcome fields. Team totals are never copied into individual
results. An empty match does not prove participation or nonparticipation. Per-lap records,
licenses, liveries, weather and recursive results are excluded.

Search rows expose session identity, timestamps, season/series, track/configuration,
event type, driver count and official status. They do not guarantee personal
finishes, incidents or other outcomes. Manifest/file/row order is preserved;
`order:"subsession_id"` identifies a time proxy, not a promised chronological sort.
`source_total` counts upstream manifest rows **before** local filtering, while
`complete` means the snapshot was fully scanned. Each page scans at most four
distinct chunks; an empty page with a continuation is valid. Search does not fetch
the entire source eagerly. Contradictory manifest parameters/counts or malformed
rows fail; omitted optional parameter echoes are allowed.

Collection `source_total` instead counts the retained projected collection after
local filtering. Neither family establishes complete upstream historical coverage.

## Six useful workflows

The following arguments are synthetic examples; resolve real identifiers first.
Each workflow has deterministic official-client fixture coverage.

1. **My recent performance:** call `get_my_driver` with `{}`, then
   `get_recent_races` with `{limit:10}`. Describe the bounded recent window and its
   source position basis; do not infer all-season performance.
2. **Find another driver:** call `find_drivers` with `{query:"Example Driver"}`.
   Inspect all ranked matches/continuations and choose a customer explicitly before
   using `cust_id` in recent/history queries.
3. **Resolve content:** call `lookup_content` with
   `{kind:"tracks",query:"Watkins Glen"}` or `{kind:"cars",ids:[1,2]}`.
   Inspect track configuration IDs and `missing_ids`; a name match is not a unique
   configuration guarantee.
4. **Find a schedule:** call `list_series_seasons` with `{series_id:20}` for active
   seasons or `{series_id:20,season_year:2026,season_quarter:4}` for an explicit
   historical period. Select a season, then call `get_series_schedule` with
   `{season_id:1234,race_week_num:0}`. Calendar dates and week numbering are explicit.
5. **Compare two races:** call `get_race_result` with
   `{subsession_id:100,cust_ids:[42]}` and `{subsession_id:101,cust_ids:[42]}`.
   Inspect attribution, nullable outcome fields and matching participants before
   comparing; do not treat team totals as driver performance.
6. **Watkins Glen history:** resolve all relevant configuration IDs, choose an
   explicit season or start range, and call `search_driver_races` with
   `{cust_id:42,range:{season_year:2026,season_quarter:4},track_ids:[30]}`.
   Continue while `next_cursor` exists, even on empty pages. For selected subsessions,
   call `get_race_result` with `{subsession_id:100,cust_ids:[42]}`. Report scanned
   pages/configurations, whether search completed, and which detail calls succeeded
   or lacked a matching participant. Partial search or selected detail calls cannot
   establish complete season performance.

A date-range alternative uses
`{range:{start:"2026-10-01T00:00:00Z",start_end:"2026-10-05T00:00:00Z"},official_only:true}`.
No team or unbounded all-driver search is exposed.

## Continuation, limits and recovery

Cursors are opaque server-side state bound to tool, filters, account generation,
page size and offset. Successful replay, including concurrent replay, returns the
same page and next token. Failed/canceled search pages do not advance the offset.
Expiry is five minutes or an earlier known safe upstream expiry; pages never
extend it. Restart, authorization loss or owner invalidation discards cursors.
Chunk 403/404 expires search state; the app never silently restarts or mixes snapshots.

One shared owner caps all collection/search tokens at 32 and retained serialized
manifests/chunks/snapshots/replay at 32 MiB. Gateway calls cap eight fetches, 16 MiB
decoded bytes and 30 seconds; individual responses cap 8 MiB with a ten-second
fetch timeout. Network concurrency is two, tool-call admission eight. Oversize
sources fail before projection; smaller pages cannot repair an oversized chunk.
These are limits, not latency guarantees.

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
| `RESPONSE_LIMIT_EXCEEDED` | Narrow source/range/filters; wait for cursor expiry or restart to release retained capacity.                                                                     |
| `CURSOR_EXPIRED`          | Repeat the initial query; never reuse the expired cursor.                                                                                                        |
| `NOT_FOUND`               | Check identifiers or select an existing simsession.                                                                                                              |
| `CONFIGURATION_ERROR`     | Repair client/configuration/mount permissions while stopped, then restart.                                                                                       |
| `INTERNAL_ERROR`          | Report the safe request ID for support.                                                                                                                          |

There is no automatic retry/sleep. JSON stderr logs use fixed redacted diagnostics
and application-generated request IDs. Do not share token documents, secrets,
environment dumps, bearer headers, cookies or signed cache URLs for support.

Stop before re-login, logout, permission repair, import or credential replacement;
see [tested recovery commands](local-container.md#stop-repair-restart-logout).
Shutdown drains HTTP before closing the credential owner. Uncertain submitted
refresh grants invalidate account state and attempt credential removal. If cleanup
cannot be confirmed, exit is nonzero: keep stopped and re-login before restarting.
Forced SIGKILL/power loss can prevent durable quarantine; it also requires stopped
re-login. Do not configure automatic restart after uncertain cleanup or restore a
consumed refresh token from backup.

## Security and supported deployment

Compose publishes only `127.0.0.1:3000`, with a non-root mapped UID/GID, read-only
root filesystem, bounded tmpfs, dropped capabilities and no Docker socket. An
owned 0700 directory and 0600 credential/secret files are checked, not bypassed.
Exact Host/Origin allowlists reduce DNS rebinding risk; local processes can still
access this unauthenticated MCP boundary. This threat model does not defend against
malicious same-user processes. iRacing tokens are never MCP bearer credentials.

LAN/public exposure, multiple refreshing owners, hot credential replacement,
container browser callbacks and hosted tenancy are unsupported. Exactly one owner
is an operator responsibility, **not an implemented process lock**. Treat returned
upstream names/text as untrusted data, never instructions.

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

Tool names, strict inputs, outputs, errors, ordering, position/date/week conventions
and continuation semantics are application API. A new tool or optional output
field can be additive when existing consumers tolerate it; strict-client consumers
still need compatibility review. Renaming/removing a tool/field, requiring an
optional argument, changing position basis, completeness or retryability is
breaking and needs explicit migration examples and contract tests. Private
version `0.0.0` supplies no published stable-version guarantee. npm packages remain
private; images use local git-SHA tags. Independent app publication/release policy
requires a later decision; no npm or image publication is included here.

Rollout stops/drains the current owner, builds the reviewed SHA image, preserves
currently valid credential ownership/modes, then starts exactly one owner. Rollback
stops/drains and restores the prior application/image, losing all in-memory cursors.
Never restore consumed refresh-token backups. If persistence/rotation is uncertain
or the credential document is incompatible, perform stopped host login first.
