# packages/mcp guidance

Inherit [repository guidance](../../AGENTS.md) and read the
[add-mcp-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md)
before modifying tools. For host composition follow
[reference host guidance](../../apps/iracing-data-mcp/AGENTS.md).

This private workspace defines three explicit MCP tool contracts:
`get_my_driver`, `get_recent_races`, and `search_race_results`. The core must remain independent
of generated Fetch/Axios clients, API configuration, OAuth, and transport.
Its input/output schemas and service contracts are tool-local. All three
capability selectors are required because all three tools are advertised. The internal
`registerApplicationTool` adapter owns input validation, final projection,
safe MCP results and cancellation. Keep request-local capability selection
explicit in each tool and business rules in its transport-independent operation.

Keep `createIracingMcpServer` unconnected and
`registerIracingTools` available for consumer-owned servers.
The consumer owns transport, session lifetime, process lifecycle,
credentials, token refresh, concrete client and linked data fetching.
This bounded adapter is not a framework: do not add a DI container, dynamic
registry, gateway, middleware pipeline, cursor infrastructure or speculative
caching. Keep advertised output schemas JSON-compatible and transformation-free;
normalize source data in operations or concrete adapters.

`#533` supersedes `#473`/`#382` only on the factory and injected domain
contracts; retain their security and lifecycle restrictions.
Run [verification](../../docs/VERIFICATION.md) and report checks accurately.
