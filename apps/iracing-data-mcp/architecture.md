# Application composition and lifetimes

The post-Docker [composition review (#378)](https://github.com/racedirector/iracing-data-api/issues/378)
retains explicit typed factories for local v1. No general DI container or Awilix
migration is required for the verified deployment. The subsequent recovery slice
adds explicit credential-owner shutdown after HTTP drain; disposal is now part of
production lifecycle, not merely process memory reclamation.

| Boundary                          | Responsibility                                                                                                                         | Lifetime                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `main.ts` / `production.ts`       | Safe executable failure boundary, configuration, non-root mount/secret validation and listener composition                             | One startup/process                                                     |
| `session.ts`                      | Secure credential store, OAuth restoration/single-flight refresh, rotation persistence and quarantine; Fetch configuration and gateway | One process/account owner; stopped login/restart replaces it            |
| Gateway and retention budget      | Canonical operations, safe DNS/TLS/cache links, bounded downloads, admission/cooldown, manifests/chunks and shared bytes/tokens        | One account owner, shared across requests                               |
| Collection/search cursor owners   | Projection pages, opaque replay, generation/expiry binding and shared retention reservations                                           | One per gateway via registrar WeakMaps; never per request               |
| `http.ts`                         | Exact Host/Origin checks, routing/upload/protocol limits, admission, cancellation and bounded drain                                    | Listener/application state; fresh SDK server and transport per MCP POST |
| `mcp.ts` / tool registrar         | Tool binding, strict safe input boundary, one bounded gateway call, projection/filtering/error normalization                           | Request bindings over shared services                                   |
| Diagnostics                       | Fixed errors, safe mapping/redaction and JSON stderr projection                                                                        | Stateless helpers; request context generated at each boundary           |
| Mounted directory/document/secret | External durable state, secure atomic replacement                                                                                      | Survives process restart; consumed credentials cannot be rolled back    |

A request's abort signal and call budget remain operation-local and must never be
retained by process owners. SDK server/transport resources close during request
finalization, including disconnect/deadline paths. Account invalidation retires
manifests/cursors immediately while health/initialize remain available.

Production shutdown stops admission and performs bounded HTTP drain, then closes
the credential owner. A submitted refresh without durable replacement is uncertain:
late grant results cannot restore ready state; removal is attempted and retained
account data is invalidated. Clean completed rotation is retained. If removal fails,
shutdown exits nonzero and the operator must keep stopped and re-login. Forced
termination cannot guarantee persistent quarantine. No lock or restart policy can
be inferred from this lifetime map; one credential owner is an operational rule.

## Deferred maintenance

The eight-tool registrar, gateway and HTTP composition contain substantial policy
and coordination. The [living architecture work (#382)](https://github.com/racedirector/iracing-data-api/issues/382)
tracks focused maintenance; the reviewed decision does not claim that debt is
resolved. Prefer characterized extraction of tool-family definitions and a reusable
safe execution boundary, then explicit typed cursor owners/capabilities. Preserve
all names, schemas, safe error semantics, query mapping, shared caps and replay.
Avoid a broad networking/auth/refactor change coupled to deployment recovery.

If a container is later justified, strict lifetimes and explicit registration are
required: process/account/gateway/cursor/retention owners remain shared; request
signals/context/SDK adapters remain scoped. Do not use a service locator in domain
tools or filesystem autoload. Disposal still requires explicit bounded drain and
irreversible token-lifecycle handling. Existing deterministic contract/recovery
fixtures must establish parity before moving these boundaries.

See [user-facing contracts](README.md), [deployment/recovery](local-container.md),
[scoped guidance](AGENTS.md) and [verification](../../docs/VERIFICATION.md).
