# MCP runtime guidance

Inherit [repository guidance](../../AGENTS.md), consult the
[MCP package guidance](../../packages/mcp/AGENTS.md), and read the
[add-MCP-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md).

This runtime hosts three required tools (`get_my_driver`, `get_recent_races`,
`search_race_results`), an optional `find_reference` tool, and injected
catalog/document/asset resource readers. Resource registration and discovery
must remain lazy; the host owns cache population and refresh.
Keep runtime transport concerns limited to an embeddable Hono router, optional
standalone HTTP listener and local stdio transport. These hosts compose the listener-free
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
container/proxy for the fixed domain-capability composition.
Local stdio loads the selected file-backed OAuth session; the current setup
uses the CLI for initial credential acquisition, independently of file loading.
The OAuth client restores sessions
and persists refreshed credentials through its token-document session store.
The shared `access-token.ts` provider retains one client and injected store/key
per credential owner. Propagate restoration failures; host code owns diagnostics.
The document store loads once; restart after external credential replacement.
Only concrete
adapters in `src/adapters` may select a generated Fetch client.

Keep MCP-client-to-host ingress authentication distinct from the host's
upstream iRacing OAuth credentials. The current `serve` configuration selects
an access token or existing stored OAuth session: the OAuth token provider
restores/refreshes, but does **not** initiate a new authorization-code or
password-limited grant. The command's parsed authentication kind is not an
agent- or hosted-actor authorization policy. Future recovery work must be
proven and separately reviewed under [#566](https://github.com/racedirector/iracing-data-api/issues/566)
and [#567](https://github.com/racedirector/iracing-data-api/issues/567),
including tool/resource protocol differences.

Do not rebuild discarded OAuth ingress/JWT flows, Docker credential
import/recovery infrastructure, long-lived HTTP sessions, or SSE transport
unless there is a concrete use case and a separate reviewed change.
Follow [verification](../../docs/VERIFICATION.md) and report executed
checks. When the local workflow changes, update
[onboarding guidance](../../.agents/skills/iracing-data-mcp-onboarding/SKILL.md).
