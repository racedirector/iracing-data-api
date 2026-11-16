# Policy-driven iRacing OAuth authorization for MCP (draft proposal)

> **Status:** Design/implementation plan only; no authentication behavior is implemented here.
> **Base:** `main`. #537, #538, #542 and #546 have merged. #544 (historical search) is independent.
> **Scope:** MCP host/runtime and the smallest necessary MCP execution adapter seam; not another OAuth server framework.

## Goal

Allow `get_my_driver` and `get_recent_races` to use the actor/account selected by
the host without requiring an agent to discover or manage authentication.

An explicit **host-owned authentication policy** chooses a permitted iRacing
OAuth flow:

- **Password Limited:** A preconfigured, authorized, unattended iRacing account
  can obtain a grant server-side without elicitation.
- **Authorization Code:** A user-delegated account can be connected via browser
  and, when needed, MCP URL-mode elicitation.

Both flow into the same actor-scoped data capability. Agents do not inspect
environment variables, choose grants, collect passwords, or receive access
tokens, refresh tokens, authorization codes, or client secrets.

This is **upstream MCP host → iRacing** authentication. It must not be confused
with OAuth **MCP client → MCP HTTP endpoint** ingress. A missing iRacing grant
must not be converted into an MCP HTTP `401` that starts the wrong OAuth flow.

## Relevant precedents and lessons

- [GitHub MCP's OAuth tool middleware](https://github.com/github/github-mcp-server/blob/main/internal/ghmcp/oauth.go):
  wraps a tool handler, checks the session before invoking it, and presents
  authorization only when necessary. Supports MCP 2026-07-28 multi-round-trip
  `input_required` and deliberate legacy fallback.
- [GitHub MCP's OAuth manager](https://github.com/github/github-mcp-server/blob/main/internal/oauth/manager.go):
  keeps authorization/refresh, single-flight attempts, cancellation, and
  timeouts outside individual tools. Its
  [Prompter](https://github.com/github/github-mcp-server/blob/main/internal/oauth/prompter.go)
  separates presenting a URL from owning the OAuth flow; a declined prompt is
  not the same as a prompt that cannot be delivered.
- [Neon's MCP HTTP transport](https://github.com/neondatabase/mcp-server-neon/blob/main/app/api/%5Btransport%5D/route.ts):
  authenticates before executing tools and distinguishes invalid credentials
  from a token-store outage. Its `401` + `WWW-Authenticate` is for authenticating
  the MCP *client* to Neon; do not copy that status code for upstream iRacing.
- [Neon's tool-error handling](https://github.com/neondatabase/mcp-server-neon/blob/main/mcp/server/errors.ts):
  separates expected client/access failures from server faults. Adopt the
  classification discipline, not arbitrary upstream error text.

These are design references, not dependencies or permission to introduce a
general-purpose authentication middleware framework.

## Boundaries

- `@iracing-data/oauth-client` remains the reusable owner of grant mechanics:
  iRacing credential masking, Password Limited grant, Authorization Code with
  PKCE/state, callback/token exchange, refresh, and storage contracts. Do not
  invoke the CLI as a library or duplicate token-endpoint requests.
- `@iracing-data/mcp` stays listener-free and transport-neutral; the two tool
  operations remain OAuth-unaware. A **small host-injected authorization guard
  at the MCP execution/registration boundary** is acceptable if required to
  return an SDK `InputRequiredResult` and read `inputResponses`. Do not add an
  Awilix container, HTTP routes, or a generic middleware pipeline to core.
- `apps/iracing-data-mcp` (or its embedding Hono host) owns explicit policy
  resolution, orchestration, session ownership, authorization attempts,
  transport-specific interaction presentation, and OAuth callback routing.
  Continue using the existing Awilix composition root.
- Local stdio has a fixed, explicit local identity/credential owner. The host
  may support a short-lived loopback callback listener for the registered
  redirect URI; no permanent HTTP listener is required.
- Hosted Hono must authenticate the MCP request, resolve its actor **and**
  explicitly permitted linked iRacing account, and inject actor-scoped
  capabilities. Never use the local CLI credential file for an HTTP actor.

## Authentication policy (not credential autodetection)

Provide a narrow, injected policy resolver selected by the host at deployment
or per verified actor/account. An illustrative contract is:

```ts
type AuthenticationPolicy =
  | { strategy: "password_limited"; credentialOwner: string }
  | { strategy: "authorization_code"; credentialOwner: string };

// The host resolves this using trusted configuration and verified identity.
// Neither the LLM nor the MCP tool gets to select the strategy.
resolveAuthenticationPolicy(actor, account): Promise<AuthenticationPolicy>
```

The runtime separately resolves the required secrets, redirect configuration,
state store, and credential store for the selected strategy. Presence of
`IRACING_AUTH_CLIENT`, `IRACING_AUTH_SECRET`, username, or password **does not
implicitly select Password Limited**. A mismatch or missing prerequisite is a
configuration failure; never silently switch to another account or grant.

Password Limited is narrowly permitted by iRacing for headless clients with
**fewer than three preregistered users**, a confidential client secret, and
properly protected account credentials. It bypasses 2FA and must **not** be
used to authenticate arbitrary hosted MCP users. Where the host acts on behalf
of other users, use Authorization Code. Operators must provision and safeguard
Password Limited credentials out of band. No form elicitation for credentials.

If a single host supports both modes, policy is scoped to the **verified
actor + selected iRacing account + credential owner**; a deployment-wide
default is permitted only when consistent with that isolation.

## Authorization guard / tool middleware

Favor a **pre-execution guard** like GitHub MCP's tool middleware, with an
exception recovery path for authorization revoked during a request:

1. Authenticate ingress where applicable; resolve trusted actor, selected
   iRacing account, policy and credential owner **before** domain execution.
2. Restore the designated session, refreshing when warranted. Respect the
   existing durable-write/rotation/quarantine contract and configured
   early-refresh window; do not treat every restoration exception as a
   missing session.
3. If ready, run the original tool once using the already selected capability.
4. If credentials require a fresh grant, ask the **policy-selected coordinator**:
   - Password Limited: grant unattended, persist under the correct credential
     owner, then run the tool. **No MCP elicitation**.
   - Authorization Code: initiate/locate an actor-bound attempt and present
     URL-mode elicitation when supported; resume after successful persistence.
5. If the tool discovers revoked authorization mid-call, classify that failure
   and re-enter **only permitted recovery**. Bound retries; do not rerun a
   mutating operation automatically (the current tools are read-only).
6. On configuration failure, upstream entitlement denial, storage corruption,
   uncertain token consumption, or client refusal, return a bounded safe result
   instead of issuing another grant.

Illustrative flow (not a mandated public TypeScript contract):

```ts
const decision = await authorization.ensureAuthorized({
  actor,
  account,
  policy,
  signal,
});

switch (decision.kind) {
  case "ready":
    return nextTool();
  case "interaction_required":
    return presentViaMcpProtocol(decision);
  case "blocked":
    return safeToolFailure(decision.reason);
}
```

The guard may be called middleware but should remain **one narrowly scoped
wrapper** around the existing MCP tool-registration/execution seam. Inspect
`packages/mcp/src/execution.ts`: it currently serializes
`AUTHORIZATION_REQUIRED` as `isError` before the runtime can return a protocol
`InputRequiredResult`. The implementation must prove a minimal host-injected
hook that can return a protocol result or delegate to the normal error
projection. Do not move OAuth mechanics into the two application operations.

## Specifics of the two iRacing OAuth flows

### Password Limited — non-interactive

- A trusted operator selects this policy and supplies client ID, client secret,
  preregistered username and password to a secret provider/environment.
- First restore an existing token document; refresh access tokens using the
  refresh grant and durable rotated refresh-token persistence.
- Use the existing `OAuthClient.passwordLimitedAuthorization()` only when an
  initial/new grant is genuinely required and policy permits it. The iRacing
  OAuth book expects this grant approximately once at startup and strictly
  rate-limits/locks out repeated failures; coalesce grants per credential owner,
  respect `Retry-After`, and do not loop on invalid credentials.
- The OAuth client already masks client secret against client ID and password
  against username. Preserve this; never expose raw or masked credentials to
  MCP responses or logs.
- **Session-key mismatch to resolve:** current
  `passwordLimitedAuthorization()` stores under the username, while the MCP
  local restoration path uses `iracing-data-mcp-local`. Decide a single
  owner-scoped storage key and test initial grant → restore → refresh without
  duplicate or orphaned sessions. Avoid speculative public OAuth client API
  changes; document any separately justified adjustment.
- Failed Password Limited authentication is an operator-facing/configuration
  failure, **not** a trigger to elicit the user's password or switch grants.

### Authorization Code — interactive

- The same guard restores/refreshes any already linked session first.
- If missing or genuinely revoked, generate an expiring, one-time,
  actor/account/credential-owner-bound authorization attempt and PKCE/state
  using the existing OAuth client.
- For hosted Hono, elicit a **host-owned connect URL**. Before redirecting to
  iRacing, require a verified browser identity and prove it matches the MCP
  actor who initiated the flow. A bearer URL plus PKCE/state does **not**
  establish the browser user's identity; otherwise an attacker could cause a
  victim's iRacing account to be linked to the attacker's actor.
- The host validates binding again on callback, atomically claims the state
  before exchange, then persists under the selected owner's session.
  In hosted/multi-instance deployments use an injected, shared TTL-backed
  attempt store or equivalent atomic claim. The current
  `OAuthClient.callback()` performs separate `get` and `del` state operations,
  which alone are not a cross-process atomic claim.
- A local stdio attempt may use a temporary loopback callback listener only
  when its registered redirect URI supports it; close it on every outcome.
  An explicitly documented CLI login/retry remains a compatibility fallback.
- Client acceptance of the URL is **not** evidence that iRacing login
  completed. Resume only after the coordinator verifies persisted credentials.

## MCP 2026-07-28 presentation and compatibility

For 2026-07-28 and newer, use the SDK's **`InputRequiredResult`** containing
an `elicitation/create` input request in `url` mode, not a pushed
`elicitation/create` request or legacy `URLElicitationRequiredError`. The client
returns its response in `inputResponses` on a retried original `tools/call`;
use `requestState` only with binding, expiry, and replay safeguards. Validate
the client request's
`_meta.io.modelcontextprotocol/clientCapabilities.elicitation.url`; an empty
`elicitation: {}` means **form-only**, not URL support. Use the pinned
`@modelcontextprotocol/server@2.3.1` APIs and test actual wire results in
stdio and HTTP. Verify the SDK's compatibility shim rather than manually
emitting protocol variants.

Older protocol versions can support their negotiated server-initiated
elicitation path when the SDK and client genuinely support it. If URL delivery
is unavailable, provide a safe, actionable manual fallback (especially local
stdio), not a fake success. Distinguish **declined/canceled** (stop) from
**prompt undeliverable** (fallback permitted). Avoid putting OAuth initiation
URLs or authorization material in general tool output where an out-of-band
client presentation is available.

No 2026 completion notification is assumed. The resumed call checks the
coordinator's actual persisted state and either executes, requests more input,
or returns a safe failure.

## Failure classification and recovery policy

| Condition | Password Limited policy | Authorization Code policy |
| --- | --- | --- |
| Existing valid/refreshable session | Execute/refresh | Execute/refresh |
| No session | Bounded unattended initial grant | URL elicitation if supported |
| Proven revoked grant | Policy-bounded reauthentication | User reauthorization |
| Wrong configured credentials or grant denied | Operator action; no repeated grants | Sanitized failure / policy-specific reauthorization |
| Insufficient scope or upstream entitlement denied | Do not assume login fixes it | Do not assume login fixes it |
| Transient OAuth/iRacing network or rate limit | Respect retry semantics | Respect retry semantics |
| Invalid/corrupt/unreadable credential document | Fail closed; operator repair | Fail closed; repair |
| Uncertain refresh-token consumption / persistence | Quarantine; no blind retry | Quarantine; no blind retry |
| User declines/cancels URL elicitation | Not applicable | Stop; no alternate grant |

Concrete current-tree risks to resolve **before** attaching an elicitation
trigger: `apps/iracing-data-mcp/src/credentials.ts` presently maps most
non-`OAuthRefreshError` restoration exceptions to
`AUTHORIZATION_REQUIRED`; a damaged store must not initiate login. Meanwhile,
`src/adapters/errors.ts` maps upstream `401`/`403` to
`UPSTREAM_UNAUTHORIZED`, which does not prove that a new grant will help.
The existing error policy permits `rotation_uncertain`/`persistence_failed`
reasons; these are not authorizable retry signals.

Classify at the trusted credential/transport boundary and pass only bounded,
secret-safe decisions to MCP. The agent should never choose the flow, inspect
secrets, or decide to overwrite uncertain session state.

## Security and acceptance criteria

- Preflight authorization must use **verified host identity**, explicit account
  selection and policy; anonymous HTTP callers cannot attach another actor's
  account or reuse local CLI credentials.
- Password Limited is permitted only for registered unattended accounts under
  explicit policy. Secrets are protected at rest and never requested from the
  user through MCP form elicitation; failures do not auto-switch to Authorization
  Code.
- Fresh state + PKCE, exact registered redirect URI, bounded TTL, single-use
  atomic callback claim, controlled scopes, consistent account/actor binding,
  and cleanup for cancel, denial, timeout, and restart.
- Hosted browser login must verify the **browser user's authenticated principal**
  matches the initiating MCP actor *before* iRacing redirect; no ability to
  prove that identity means no remote linking.
- No codes, passwords, client secrets, access/refresh tokens, callback query
  parameters, or arbitrary upstream exception bodies in model-facing results,
  stdout, logs, or redirected diagnostic pages.
- Never assume client `accept` means OAuth success; never silently launch a
  remote browser or escalate scopes.
- Serialize/constrain both initial grants and refresh-token rotation by
  credential owner, including across processes where supported. Quarantine
  uncertain consumption/persistence and avoid repeated Password Limited grants.
- Keep both stdio and Hono usable with explicit client/protocol compatibility;
  no mandatory auth tool or general OAuth ingress changes.

## Implementation order / review gates

1. **Protocol spike:** With pinned SDK, demonstrate a tiny authorization guard
   around one existing tool that yields 2026 `input_required`, receives
   `inputResponses`, delegates when ready, and remains safe for clients without
   URL elicitation. Test stdio and Hono. Keep core listener-free and decide the
   minimal injected seam from evidence.
2. **Policy + classifier:** Introduce explicit policy resolution and
   `ensureAuthorized` coordinator contract; correct restoration/error
   classifications. Test no-env-autodetection, actor/account ownership, and
   blocked recovery.
3. **Local Password Limited:** Wire the existing grant and durable session
   restoration without elicitation; reconcile storage key; prove single-flight,
   refresh, invalid credentials, rate limit/lockout and quarantine behavior.
4. **Local Authorization Code:** Reuse PKCE/state/callback, implement safe URL
   elicitation and manual fallback, then test resume, cancellation, timeout and
   replay using synthetic credentials.
5. **Hosted Authorization Code (separate gate):** Require browser-identity
   equivalence, shared atomic attempt storage, actor/account scoping and host
   credential storage. Do not enable merely because a public callback exists.
6. **Regression and docs:** Verify early-refresh policy use (#542), inherited
   credential lifecycle (#538), client version behavior, and existing tools;
   update runtime README/onboarding and applicable agent regression scenarios.

Run dependency-aware builds, targeted runtime/MCP/OAuth tests, scoped lint/style,
`pnpm verify:repo`, `pnpm verify:js`, and the applicable full repository checks.
Report actual passes, skips, and environment limits. Use synthetic fixtures;
report any optional live iRacing verification separately.

## Non-goals

- No MCP client-to-server OAuth ingress redesign, Better Auth integration,
  generic multi-user identity service, or historical search (#544).
- No new authentication tool unless a tested client compatibility need exists.
- No environment inspection by the LLM, password collection through elicitation,
  generic auth middleware framework, or eager startup login for every actor.
- This documentation commit requires no generated files, package release, or
  public-version bump. Scope public OAuth API changes separately if unavoidable.

## Primary references

- [MCP elicitation specification (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation)
- [MCP elicitation legacy (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation)
- [iRacing OAuth flow overview](https://oauth.iracing.com/oauth2/book/authentication_flows_overview.html)
- [iRacing Password Limited flow](https://oauth.iracing.com/oauth2/book/password_limited_flow.html)
- [iRacing /token grant details and rate limits](https://oauth.iracing.com/oauth2/book/token_endpoint.html)
- [GitHub MCP OAuth middleware](https://github.com/github/github-mcp-server/blob/main/internal/ghmcp/oauth.go)
- [Neon MCP transport and authentication boundary](https://github.com/neondatabase/mcp-server-neon/blob/main/app/api/%5Btransport%5D/route.ts)
