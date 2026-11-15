# Core contract review

The core always advertises both tools, so both selectors are required before
registration. Selection still occurs per request using host-verified identity;
registration never resolves credentials or calls a query.

`complete` means that all entries in the supplied upstream recent-race window
were returned. It is false when the requested limit truncates that window.
Neither value promises exhaustive driver history.

The adapter reports signed-link deadline failures as `DATA_RESOLUTION_FAILED`
with `link_expired`; HTTP 403/404 uses `link_rejected`, not an assertion of expiry
or account authorization failure. Both are non-retryable by default: automatic
retries of the same link are not justified. No signed URL, body or credentials
enter the core envelope. An operator may investigate or initiate a new operation
to obtain fresh data. These are not continuation cursors.

The core's fixed errors contain no transport-specific operational instructions.
Local credential recovery is described in [the runtime guide](README.md).
A consumer selecting actors
per request must implement its own access restoration and account-access policy.
Transient refresh retries still require explicit `transient_refresh` evidence;
unknown rotation state remains non-retryable.

The local recent-races adapter preserves the existing explicit `cust_id` lookup
using the host's selected iRacing credentials and upstream access enforcement.
It does not claim to restrict lookups to the authenticated driver's ID. Core
identity matching checks response integrity, not authorization. An actor-resolved
host must enforce any narrower account policy in its selected capability before
querying; caller-controlled `cust_id` is never a principal selector in the core.

The generic `build-mcp-app` and `build-mcp-server` upstream skill/reference
assets are excluded from this core PR. Their byte-for-byte reintroduction,
lock entries and formatting exclusions belong in a dedicated guidance PR
immediately after the Hono/stdio runtime (#538). Project-specific tool guidance
remains authoritative; vendored examples do not override repository boundaries.
