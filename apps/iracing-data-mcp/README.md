# iracing-data-mcp

`apps/iracing-data-mcp` is the private MCP application for exposing bounded, agent-oriented iRacing Data API capabilities. It is a sibling protocol adapter over the maintained OAuth client, generated Fetch client, and API schemas; it is not a telemetry application and does not sit on top of another repository application or API router.

## Current boundary

This initial workspace establishes only the application and service seams:

- `McpServices` holds long-lived OAuth and Data API dependencies.
- `createMcpServer()` creates a fresh official-SDK server instance around those shared services.
- `registerMcpTools()` is the request-scoped registration seam for later tool slices.
- `McpApplicationConfigSchema` owns app-local server identity configuration.

Streamable HTTP handling, loopback protections, OAuth/session integration, Data API gateway behavior, stable errors/redaction, Docker packaging, and concrete tools are intentionally implemented by later issues in the MCP backlog.

## Development

From the repository root:

```bash
pnpm --filter @iracing-data/iracing-data-mcp build
pnpm --filter @iracing-data/iracing-data-mcp test
```

See [scoped guidance](AGENTS.md) and the repository [verification contract](../../docs/VERIFICATION.md) before changing boundaries or dependencies.
