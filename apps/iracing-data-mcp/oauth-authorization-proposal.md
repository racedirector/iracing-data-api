# Interactive iRacing OAuth authorization from MCP (draft proposal)

> **Status:** Design/implementation placeholder. No behavior is implemented by this document.
> **Stack:** `main` → [#537](https://github.com/racedirector/iracing-data-api/pull/537) → [#538](https://github.com/racedirector/iracing-data-api/pull/538) → this change.
> This is a sibling of [#544](https://github.com/racedirector/iracing-data-api/pull/544), not a dependency of historical search.

## Goal

When an MCP tool cannot access iRacing because the selected account needs
authorization, the MCP client can direct the human user to an iRacing OAuth
authorization flow. The user authenticates in a browser; the runtime receives
the callback and securely persists the resulting session. The client/LLM never
receives iRacing access tokens, refresh tokens, authorization codes, passwords,
or client secrets. Once authorization is complete, the user/agent can retry the
original tool.

This is **upstream iRacing authorization** (MCP host → iRacing), not OAuth
authorization of the MCP client to access the MCP HTTP endpoint.

## Proposed boundaries

- `@iracing-data/oauth-client`: retain PKCE, state, authorization-code exchange,
  scope handling, refresh, and session storage contracts. Reuse these APIs; do not
  reconstruct OAuth protocol logic in the MCP package.
- `@iracing-data/mcp`: preserve the listener-free tool/capability surface and
  sanitized, host-neutral application failures. Do not import the CLI, own HTTP
  routes, store credentials, or embed local login instructions in core errors.
- `apps/iracing-data-mcp`: compose the authorization interaction and existing
  credential restoration. Transport-specific presentation/callback plumbing
  belongs here or in an embedding host, not in the two query tools.
- Local stdio: select only the explicit local credential owner. A temporary
  loopback callback listener may be started for a user-initiated OAuth attempt
  if the registered redirect URI supports it; there is no permanent MCP HTTP
  listener requirement.
- Embedded Hono HTTP: the embedding host authenticates each request, selects
  the appropriate linked iRacing account, and supplies the actor-bound callback
  destination, state store and credential owner. Never read or write the local
  CLI credential document for an HTTP actor.

Prefer one narrow authorization initiation/recovery seam over a generic OAuth
framework or a second copy of the CLI. Do not add a mandatory MCP authentication
tool unless a client-compatibility requirement justifies it.

## Client interaction

1. An MCP tool attempts an actor-scoped iRacing query. Missing/invalid/insufficient
   authorization is classified separately from transport/configuration errors or
   a proven transient refresh failure.
2. For clients supporting MCP **URL mode elicitation** (protocol version and
   client capability permitting), present a short-lived, actor-bound URL to start
   the authorization interaction. Evaluate the current SDK implementation and
   whether `URLElicitationRequiredError` or `elicitation/create` is appropriate
   for a tool request; do not implement unsupported protocol messages by hand.
3. The user explicitly opens the URL and signs in with iRacing. The callback
   validates the original state/PKCE context, preserves the correct actor/account
   binding, and persists tokens under the designated session owner.
4. The MCP client is notified of completion where supported; otherwise the agent
   can instruct the user to retry after finishing browser login.
5. If the MCP client cannot handle URL elicitation, retain a safe, actionable
   fallback (for local stdio, the existing CLI login command is acceptable).
   Don't assume every client renders or follows URLs supplied in tool errors.

A generated URL is an authorization capability: do not emit reusable, unbounded,
cross-actor, or attacker-controlled initiation links. The URL may be visible to
the MCP client; secrets and resulting tokens must not be.

## Security and correctness acceptance criteria

- Fresh random `state` and PKCE per attempt; allowed, registered redirect URIs;
  single-use callback correlation; expiry, cancellation and listener cleanup.
- Actor/session/account binding survives redirects and prevents account mixing
  across concurrent logins and HTTP users; invalid/mismatched/replayed callbacks
  fail closed. Never use an MCP-supplied actor ID as proof of identity.
- No password/authorization code/token/secret in MCP results, messages, model
  context, stdout, logs or URLs used as handoff links. Do not leak callback
  parameters through redirects or diagnostic responses.
- Credential writes and refresh-token rotation follow the finalized #538
  single-owner/quarantine policy. Uncertain consumption or persistence must not
  trigger blind retry or unsafe recovery.
- Reject or safely end declined, canceled, timed-out and failed authorization.
  Do not interpret a client's acceptance of the URL as successful OAuth.
- No silent browser auto-launch by a remote MCP server; no unsolicited scope
  escalation. Use the minimum supported iRacing scopes for the requested query.
- The authenticated HTTP actor and linked account remain independent from the
  local CLI account. An anonymous HTTP caller must not be able to initiate or
  bind authorization to another actor.
- Feature remains usable with supported stdio and Hono transports, with explicit
  documentation of client/transport compatibility and fallback behavior.

## Verification before marking ready

- Isolated tests for authorization-required classification and sanitized
  user-facing recovery; no retry loop on wrong credentials or revoked access.
- Simulated OAuth initiation, callback, state/PKCE mismatch, replay, timeout,
  cancellation, concurrent attempts, wrong actor/account, and persistence failure.
- Tests for supported URL elicitation clients and unsupported-client fallback,
  including completion/retry behavior and redaction.
- Credential restoration/rotation regression tests inherited from #538, plus
  scoped runtime tests, package builds, lint/style, and repository verification.
- Update runtime README, OAuth/onboarding guidance and any affected agent
  regression scenarios in the same implementation change.
- Use synthetic OAuth fixtures; no live iRacing credentials in tests or logs.
  Report any live manual verification separately.

## Review dependencies / non-goals

- Do not implement against unsettled #538 credential ownership; resolve its
  restoration, rotation and quarantine review first.
- #542 (OAuth early-refresh policy) is merged into `main`; rebase the MCP stack
  and verify the runtime consumes this capability intentionally before shipping.
- No change to MCP client→server OAuth ingress, Better Auth, generalized hosted
  multi-user auth framework, historical search (#544), or the two core MCP tools.
- No new public package contract, version bump, or code generation is proposed
  by this planning-only commit. The implementation can adjust these decisions
  if verified requirements warrant a focused change.

## Protocol reference

- [MCP URL mode elicitation (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation)
- [MCP URL mode elicitation (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation)
