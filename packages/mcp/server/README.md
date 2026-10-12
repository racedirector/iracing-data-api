# iRacing MCP server implementation

`@iracing-data/mcp-server` is a private workspace package containing the existing
iRacing MCP server factory, known tools, Data API gateway/link resolution,
projections, cursors, retention and shared diagnostics. The extraction establishes
a reusable implementation boundary while preserving the current tool behavior.
It is not a public release target.

The [application host](../../../apps/iracing-data-mcp/architecture.md) consumes this
package and still owns HTTP/transport sessions, ingress authorization, production
configuration, credential import/refresh/persistence and process shutdown. It
constructs the existing `McpServices` bag and passes it to `createMcpServer`.
The factory accepts the same validated name/version identity supplied by the host.

This first slice deliberately retains the current service contract, including
`OAuthClient`, generated Fetch configuration, authorization state and the shutdown
hook. The package also retains the OAuth dependency used by shared failure mapping.
These are temporary seams for the next boundary issue; no credential store,
provider framework or new HTTP adapter is introduced here.

Build the package and its dependencies from the repository root:

```sh
pnpm --filter '@iracing-data/mcp-server...' build
pnpm --filter '@iracing-data/mcp-server' test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter '@iracing-data/iracing-data-mcp' test
```

Gateway/link-resolution tests live in this package. Tool contract tests remain in
the app because they exercise this package through the existing HTTP host; their
fixtures explicitly consume the package. HTTP/session/auth/credential lifecycle
tests remain with that host. See [repository verification](../../../docs/VERIFICATION.md)
for the full pre-merge contract.
