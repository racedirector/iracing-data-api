# iRacing MCP

`@iracing-data/mcp` is a private, listener-free package. It owns eight
tool registrations, projections, sanitized errors, bounded continuations,
and an optional factory for a fresh, **unconnected** `McpServer`.

```ts
import { Configuration } from "@iracing-data/api-client-fetch";
import { createIracingMcpServer } from "@iracing-data/mcp";
import { createGeneratedDriverQueries } from "@iracing-data/mcp/generated-driver";

const tokenProvider = { getAccessToken: () => obtainTokenFromHost() };
const driverQueries = createGeneratedDriverQueries({
  accessTokenProvider: tokenProvider,
});
const configuration = new Configuration({
  accessToken: () => tokenProvider.getAccessToken(),
});
const continuationScope = {}; // stable within one credential owner

const server = createIracingMcpServer({
  serverInfo: { name: "consumer-service", version: "1.0.0" },
  services: {
    getDriverQueries: (_context) => driverQueries,
    getDataApiAccess: (_context) => ({ configuration, continuationScope }),
  },
});
// Consumer controls server.connect(transport), session lifetime, and close().
```

Existing consumers can call `registerIracingTools(server, services)` on
their own server. Both APIs register the same eight tools once. No listener,
transport, OAuth grant, process handler, or credential store is constructed
or installed by this package.

`DriverQueries.getCurrent({signal})` is a domain-specific, transport-free
contract. The host selects the capability using request-local
`getDriverQueries(context)` and optional verified ingress identity.
The `get_my_driver` tool has no generated-client or token dependencies.
The optional `./generated-driver` adapter uses the generated `MemberApi`,
a lazily invoked `AccessTokenProvider.getAccessToken()`, and an injectable
`fetchApi`. Signed HTTPS links are validated and fetched without inherited
bearer credentials or headers, with redirects rejected. Custom fetch
implementations must honor these options. The host remains responsible
for refresh/persistence and choosing the correct principal.

The seven unmigrated tools retain generated access via
`getDataApiAccess(context)` and a stable opaque `continuationScope`
to isolate retained cursors. Each scope retains at most 32 tokens and
32 MiB for up to five minutes; MCP results are limited to 64 KiB.
Do not share scopes between users.

Issue #533 intentionally supersedes two historical prohibitions in #473
and #382: this package may construct *unconnected* servers, and tool
handlers may consume narrow domain-level capabilities. Their remaining
restrictions apply: no generic gateway, DI container, listener, session
registry, ingress auth, credential persistence, or process lifecycle here.
Issue #478's historical export/name guidance requires eventual reconciliation.

See [the reference host](../../apps/iracing-data-mcp/architecture.md).

```sh
pnpm --filter '@iracing-data/mcp...' build
pnpm --filter @iracing-data/mcp test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
```

Package exports: `createIracingMcpServer`, `registerIracingTools`,
`DriverQueries`, `Driver`, `IracingToolServices`,
`IracingToolContext`, `IracingDataAccess`, `IracingToolRegistry`
and the existing failure/diagnostic surface. The
`./generated-driver` subpath exports `createGeneratedDriverQueries`,
`GeneratedDriverOptions`, and `AccessTokenProvider`.
