# MCP runtime guidance

Inherit [repository guidance](../../AGENTS.md), consult the
[MCP package guidance](../../packages/mcp/AGENTS.md), and read the
[add-MCP-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md).

This publishable runtime hosts `get_my_driver`, `get_recent_races`, and
`search_race_results`. Keep it limited to an embeddable Hono router, optional standalone HTTP
listener and local stdio transport. These hosts compose the listener-free
`@iracing-data/mcp` factory with injected tool-local capabilities.
Use explicit memoized getters in `composition.ts` and the Zod boundary in
`cli/commands/serve/schema.ts`; do not introduce a generic execution framework.

The path-independent HTTP transport accepts host-selected tool services.
Authenticated embedding hosts must verify callers and supply their account's
capabilities, never silently falling back to local credentials.
The standalone development HTTP command is explicitly unauthenticated,
loopback-only and uses the host-selected credential document. Do not fabricate
an authenticated actor or expose this listener publicly. Its only endpoint is
`/mcp`; other paths return empty 404 responses. Multi-user request-scope integration
belongs in a separate change.
Both transports accept `IracingToolServices`; compose these outside transports.
Keep one lazy capability instance and OAuth lifecycle owner per credential owner
across requests. Cache adapters, never access-token values or request context.
Do not globally cache request-local capability resolution or introduce a DI
container/proxy for the fixed three-capability composition.
Local stdio loads the selected file-backed OAuth session; the current setup
uses the CLI for initial credential acquisition, independently of file loading.
The OAuth client restores sessions
and persists refreshed credentials through its token-document session store.
The shared `access-token.ts` provider retains one client and injected store/key
per credential owner. Propagate restoration failures; host code owns diagnostics.
The document store loads once; restart after external credential replacement.
Only concrete
adapters in `src/adapters` may select a generated Fetch client.

Do not rebuild discarded OAuth ingress/JWT flows, Docker credential
import/recovery infrastructure, long-lived HTTP sessions, or SSE transport
unless there is a concrete use case and a separate reviewed change.
Follow [verification](../../docs/VERIFICATION.md) and report executed
checks. When the local workflow changes, update
[onboarding guidance](../../.agents/skills/iracing-data-mcp-onboarding/SKILL.md).
