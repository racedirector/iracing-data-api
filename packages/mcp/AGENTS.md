# packages/mcp guidance

Inherit [root guidance](../../AGENTS.md). Consult
[host guidance](../../apps/iracing-data-mcp/AGENTS.md) for transport and
authorization changes.

This is a private workspace. Issue #533 supersedes restrictions in #473
and #382 **only** to allow the listener-free server factory and narrow,
request-local injected driver queries. Keep `registerIracingTools`
available for consumer-owned servers.

This package owns tool registration, projections, sanitized errors, safe
linked-response handling, and bounded continuations. The consuming host
owns HTTP transports, logical sessions, ingress auth, upstream OAuth
refresh/persistence, and shutdown. Core tool modules must not import
the generated driver adapter. Explicit factory injection only: no
Awilix, generic gateway, service locator, speculative caching, or
provider registry. Keep the other seven tools' generated-client
behavior unchanged. Follow [verification](../../docs/VERIFICATION.md).
