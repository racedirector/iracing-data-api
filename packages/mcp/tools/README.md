# iRacing MCP tools

`@iracing-data/mcp-tools` registers eight iRacing tools onto a caller-owned MCP
server. It is a private workspace package, not a publication target. The host owns
server identity, protocol versions, transports, ingress auth, credentials and shutdown.

```ts
import { Configuration } from "@iracing-data/api-client-fetch";
import { McpServer } from "@modelcontextprotocol/server";
import { registerIracingTools } from "@iracing-data/mcp-tools";

const server = new McpServer({ name: "consumer-service", version: "1.0.0" });
const configuration = new Configuration({
  accessToken: async () => obtainToken(),
});
const continuationScope = {};
registerIracingTools(server, {
  getDataApiAccess: () => ({ configuration, continuationScope }),
});
```

The maintained schemas feed OpenAPI and generated Data API clients. Each tool uses
the generated APIs directly. The access seam supplies only execution configuration
and an opaque object for retained continuation isolation. Keep that object stable
for the same access owner; replacing it makes old cursors inaccessible. It carries
no account, tenant, storage or authorization model. The host may select access using
request-local `signal` and optional `authInfo`; the package interprets no claims.

Linked responses use credential-free HTTPS fetches, reject redirects and embedded
credentials, propagate cancellation and validate payloads before projection. A
custom `Configuration.fetchApi` also handles linked requests with no inherited
headers; its implementation must honor the supplied request options and must not
add bearer credentials to opaque URLs.

Each tool module owns its input/output contracts, invocation and projections.
Adding a normal tool requires that module and one entry in [register.ts](src/register.ts).
The SDK validates structured output. A small execution helper projects failures
into fixed sanitized errors without returning upstream bodies, tokens or URLs.

Collection and search cursors retain deterministic replay for at most five minutes
(or earlier linked expiry), 32 tokens and 32 MiB per scope across both families.
Serialized MCP results are capped at 64 KiB. Search alone owns manifest/chunk
semantics, bounded per-page scanning and chunk filename containment. It consumes
the corrected generated `search_series` manifest model.

The [reference host](../../../apps/iracing-data-mcp/architecture.md) composes its
own server, file-backed OAuth refresh/persistence, Express and session lifecycle.
Other consumers can supply their own credential/storage choices.

```sh
pnpm --filter '@iracing-data/mcp-tools...' build
pnpm --filter @iracing-data/mcp-tools test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
```

Supported integration exports are `registerIracingTools`, `IracingToolRegistry`,
`IracingToolServices`, `IracingDataAccess`, `IracingToolContext` and the sanitized
failure/diagnostic contract used by the reference host. Internal cursor classes,
tool schemas, network implementations and host factories are not package exports.
