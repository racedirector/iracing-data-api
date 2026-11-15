# iRacing MCP

`@iracing-data/mcp` defines **what** an iRacing Data API MCP server provides
and **which capabilities** it requires. It is private, listener-free,
credential-free, client-agnostic and contains exactly two tools:

- `get_my_driver`: current driver identity through tool-local `DriverQueries`.
- `get_recent_races`: a bounded recent-race window through `RecentRaceQueries`.

Both tools register explicitly through the package-internal
[`registerApplicationTool`](src/execution.ts) adapter onto the MCP SDK.
Their input/output schemas, narrow service interfaces and domain operations
live beside each tool. Each execution callback visibly selects its request-local
capability; operations retain source validation, identity checks and bounds.
They return `Result` values, never MCP envelopes. There is no dynamic registry,
middleware pipeline, gateway, provider registry or DI container.

The adapter parses input once (including defaults and async refinements/transforms)
before dependency effects, generates one correlation context, normalizes expected
failures and exceptions, projects output, and builds equivalent structured/JSON-text
results. SDK-native invalid-input errors are text-only, so input parsing is
deliberately deferred to retain the fixed sanitized `INVALID_INPUT` envelope.
The SDK still owns protocol validation, dispatch and final output validation.

Wire output schemas must be JSON-compatible object schemas without transforms.
Use source schemas or domain code for normalization; the adapter presents the
parsed output, never unprojected service data. Unrepresentable schemas fail during
registration. Expected failure descriptors preserve code-specific safe reasons;
retry delays require a retryable code or explicit `transient_refresh` reason.
Existing injected capabilities may still throw `ApplicationFailure`.

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
Selectors receive optional internally generated `context.request` correlation
alongside the signal and host-verified identity. Domain operations receive only
the cancellation signal, not MCP correlation or identity context. Cancellation stops work and
propagates a fixed safe abort to the SDK, which suppresses cancelled responses;
it is not an upstream outage. No arbitrary abort reason is serialized.
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

Core tests include compile-only inference fixtures via `test:types`. No live
iRacing credentials are required. OAuth interaction, caching, configurable
presenters and lifecycle middleware are separate changes, not adapter hooks.
