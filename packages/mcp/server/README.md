# iRacing MCP server implementation

`@iracing-data/mcp-server` is a private workspace package containing the existing
iRacing MCP server factory, known tools, Data API gateway/link resolution,
projections, cursors, retention and shared diagnostics. The extraction establishes
a reusable implementation boundary while preserving the current tool behavior.
It is not a public release target.

The [application host](../../../apps/iracing-data-mcp/architecture.md) consumes this
package and still owns HTTP/transport sessions, ingress authorization, production
configuration, credential import/refresh/persistence and process shutdown. It
provides `McpServices.getDataApiGateway(context)` to `createMcpServer`.
The factory accepts the same validated name/version identity supplied by the host.

The only tool access capability is a function returning an account-owned
`DataApiGateway`, synchronously or asynchronously. The request context contains
the cancellation signal and optional framework-validated ingress `AuthInfo`.
The host interprets that identity and selects an upstream account; the package
performs no claim mapping or authorization policy.

A local host can return one fixed gateway configured with the generated Fetch
`Configuration.accessToken` callback. A database-backed host can obtain tokens
in the same callback and select a separate gateway for each account. Credential
refresh and persistence remain in that callback's host implementation. Return a
stable gateway per account so continuations reuse its cursor/retention owners;
never share a gateway across accounts. Call `gateway.invalidate()` when replacing
an account or revoking its access. Request context must not be retained in the
long-lived gateway or token callback. Failures from the host should be sanitized
`ApplicationFailure` instances.

The package requires no OAuth client, token document, credential path, health
callback or shutdown hook. The app owns these through its local composition and
separate HTTP health/shutdown options. Production passes only the provider's
`getDataApiGateway` function into the package; OAuth failure classification also
lives in the app.

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
