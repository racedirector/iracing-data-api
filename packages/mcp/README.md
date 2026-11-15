# iRacing MCP

`@iracing-data/mcp` defines **what** an iRacing Data API MCP server provides
and **which capabilities** it requires. It is private, listener-free,
credential-free, client-agnostic and contains exactly two tools:

- `get_my_driver`: current driver identity through tool-local `DriverQueries`.
- `get_recent_races`: a bounded recent-race window through `RecentRaceQueries`.

Both tools directly register with the MCP SDK. Their input/output schemas and
narrow service interfaces live beside each tool. Each handler explicitly
validates input, resolves a capability using request-local context, forwards
cancellation, validates and projects results, and sanitizes errors. There is
no generic execution framework, gateway, provider registry, or DI container.

```ts
import { createIracingMcpServer } from "@iracing-data/mcp";

const server = createIracingMcpServer({
  serverInfo: { name: "consumer", version: "1.0.0" },
  services: {
    getDriverQueries: (context) => myDriverQueriesFor(context.authInfo),
    getRecentRaceQueries: (context) => myRecentRaceQueriesFor(context.authInfo),
  },
});
// Consumer owns connection, transport, session lifetime, and close().
```

Consumers with their own MCP server may instead call
`registerIracingTools(server, services)`. Neither API connects transport,
starts listeners, resolves credentials, or installs process handlers.

The package never selects an HTTP implementation. Its two tool-local
interfaces are implemented in the consuming application. The reference
host uses generated Fetch clients in its
[driver adapter](../../apps/iracing-data-mcp/src/adapters/driver.ts),
[recent-races adapter](../../apps/iracing-data-mcp/src/adapters/recent-races.ts),
and [linked-response handler](../../apps/iracing-data-mcp/src/adapters/linked-response.ts).
A separate consumer can use generated Axios, mocks or another data source.
OAuth refresh and persistence belong only to the host. Signed HTTPS data links
are fetched by adapters without forwarded bearer credentials or redirects.

Both tool outputs include equivalent structured content and JSON text
within a combined 64 KiB cap. Errors use fixed allowlisted messages,
codes, metadata and internally generated request IDs. Tool calls are
read-only, require the host-selected authorization, and propagate cancellation.
`get_recent_races` returns up to ten upstream window entries (not complete
race history) and has **no cursor or retained collection state**.

Issue #533 supersedes the old restrictions in #473 and #382 only for
the unconnected server factory and narrow domain capability injection.
No generic transport/host lifecycle, credential management, or generated
API client dependency belongs in this package.

See the [reference host](../../apps/iracing-data-mcp/README.md) and the
[add-mcp-tool skill](../../.agents/skills/add-mcp-tool/SKILL.md).

```sh
pnpm --filter '@iracing-data/mcp...' build
pnpm --filter @iracing-data/mcp test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
```
