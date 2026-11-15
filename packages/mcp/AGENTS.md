# packages/mcp guidance

Inherit [repository guidance](../../AGENTS.md) and read the
[add-mcp-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md)
before modifying tools. For host composition follow
[reference host guidance](../../apps/iracing-data-mcp/AGENTS.md).

This private workspace defines two explicit MCP tool contracts,
`get_my_driver` and `get_recent_races`. The core must remain independent
of generated Fetch/Axios clients, API configuration, OAuth, and transport.
Its input/output schemas and service contracts are tool-local. Tool handlers
use direct `registerTool` calls with visible validation, request-local
capability selection, cancellation, result projection, and safe failures.

Keep `createIracingMcpServer` unconnected and
`registerIracingTools` available for consumer-owned servers.
The consumer owns transport, session lifetime, process lifecycle,
credentials, token refresh, concrete client and linked data fetching.
Do not add a DI container, generic executor, `ToolDefinition` registry,
gateway, shared pipeline, cursor infrastructure or speculative caching.

`#533` supersedes `#473`/`#382` only on the factory and injected domain
contracts; retain their security and lifecycle restrictions.
Run [verification](../../docs/VERIFICATION.md) and report checks accurately.
