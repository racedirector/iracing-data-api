# MCP runtime guidance

Inherit [repository guidance](../../AGENTS.md), consult the
[MCP package guidance](../../packages/mcp/AGENTS.md), and read the
[add-MCP-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md).

This private app hosts only `get_my_driver` and `get_recent_races`.
Keep it limited to an embeddable Hono router, optional standalone HTTP
listener and local stdio transport. Both compose the listener-free
`@iracing-data/mcp` factory with injected tool-local capabilities.
Use Awilix in `composition.ts` and a Zod defaults/transform boundary in
`config.ts`; do not introduce a generic execution framework.

The HTTP host must resolve a verified actor from each Request and inject
the actor's iRacing account capabilities. Never read the local CLI
credential document on behalf of an HTTP caller. Null actors fail closed.
Local stdio loads the selected file-backed OAuth session; the current setup
uses the CLI for initial credential acquisition, independently of file loading.
The OAuth client restores sessions
and persists refreshed credentials through its token-document session store.
Only concrete
adapters in `src/adapters` may select a generated Fetch client.

Do not rebuild discarded OAuth ingress/JWT flows, Docker credential
import/recovery infrastructure, long-lived HTTP sessions, or SSE transport
unless there is a concrete use case and a separate reviewed change.
Follow [verification](../../docs/VERIFICATION.md) and report executed
checks. When the local workflow changes, update
[onboarding guidance](../../.agents/skills/iracing-data-mcp-onboarding/SKILL.md).
