# Minimal Node HTTP MCP server

[Source](src/index.ts) is the entire example: configure an existing iRacing token,
construct one shared `DataApiGateway`, and return `createMcpServer({ config, services })`
from the official SDK handler's factory. It imports only package exports and SDK
adapters, with no dependency on the repository's executable MCP app.

From the repository root, using the pinned Node/pnpm toolchain:

```sh
pnpm --filter 'iracing-node-mcp-server...' build
cp examples/node-mcp-server/.env.example examples/node-mcp-server/.env
# Set IRACING_ACCESS_TOKEN in that .env, without the Bearer prefix.
pnpm --filter iracing-node-mcp-server start
```

Connect a Streamable HTTP MCP client to `http://127.0.0.1:3000/mcp`.
`PORT` can override the example port. Discovery works without fetching upstream
Data API data; tool calls use the supplied token. Token acquisition is separate:
see the [first-call example](../data-api-first-call/README.md#need-a-token).

Node supplies the listener; the SDK supplies Host/Origin guards, body handling and request/response adaptation. Every path is forwarded to MCP, so `/mcp` is a convention here rather than an application router.

These examples deliberately use the SDK's stateless legacy handler. Each HTTP
exchange gets a fresh MCP server while sharing the account gateway and its
continuations. They target the package's supported 2025 protocol versions; they
do not reproduce the persistent session host required by #432. They have no MCP
ingress login, token refresh/storage, health endpoint, admission policy or graceful
drain. Those remain consumer hosting choices; compare the
[application host](../../apps/iracing-data-mcp/architecture.md).

The visible package seam is still concrete: callers import the generated Fetch
`Configuration` and construct a package `DataApiGateway`, rather than supplying an
arbitrary Data API client. `services.getDataApiGateway(context)` can select a stable
gateway by ingress identity; this single-account example ignores that context.
Credential refresh could live in `Configuration.accessToken`, and MCP transport,
Express middleware and process lifecycle remain outside the package. No package
API changes or publication decisions are made by this example.
