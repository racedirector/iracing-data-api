# packages/mcp guidance

Inherit [repository guidance](../../AGENTS.md) and read the
[add-mcp-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md)
before modifying tools. For host composition follow
[reference host guidance](../../apps/iracing-data-mcp/AGENTS.md).

This publishable workspace defines three required MCP tool contracts:
`get_my_driver`, `get_recent_races`, and `search_race_results`.
The optional `find_reference` lookup is advertised only when a host supplies
`getReferenceQueries`. The core also defines lazily resolved reference,
document and asset resources; resource discovery never acquires credentials
or fetches data.
The core must remain independent of generated Fetch/Axios clients, API
configuration, OAuth, and transport. Input/output schemas and service contracts
are tool-local. All three capability selectors are required because all three
tools are advertised. The internal
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

**Architecture authority:** the current exported factory/registrar,
`src/execution.ts`, tool-local contracts and resource definitions are authoritative
for implemented behavior; this guidance names ownership boundaries. Earlier
planning issues [#382](https://github.com/racedirector/iracing-data-api/issues/382),
[#473](https://github.com/racedirector/iracing-data-api/issues/473),
[#478](https://github.com/racedirector/iracing-data-api/issues/478)
and [#533](https://github.com/racedirector/iracing-data-api/issues/533)
record historical requirements, not a mandate to restore the old
`@iracing-data/mcp-tools` package, generated-client imports into core,
Awilix, Express or removed tool names. Retain the security and lifecycle
invariants only where they still apply to current owners.

For upstream OAuth interruption/recovery, the host retains grant and policy
ownership. [#566](https://github.com/racedirector/iracing-data-api/issues/566)
/ [#567](https://github.com/racedirector/iracing-data-api/issues/567)
must first establish the narrow protocol seam for tools and resources; do not
silently convert authentication failures into ordinary tool results or add a
generic middleware framework.
Run [verification](../../docs/VERIFICATION.md) and report checks accurately.
