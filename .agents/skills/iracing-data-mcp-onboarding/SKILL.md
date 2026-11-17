---
name: iracing-data-mcp-onboarding
description: Set up iRacing MCP over local stdio or embed its HTTP handler.
---

# iRacing Data MCP onboarding

Read [repository guidance](../../../AGENTS.md),
[app guidance](../../../apps/iracing-data-mcp/AGENTS.md), and
[runtime documentation](../../../apps/iracing-data-mcp/README.md).

## Local stdio

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm iracing-data auth login --scope iracing.auth
pnpm mcp:local
```

Login creates `.iracing-data/iracing-data-mcp/credentials.json`. Never paste
credentials into chat. Select another document with `IRACING_CREDENTIALS` or
`iracing-data-mcp serve --credentials /absolute/path/to/credentials.json`.
Explicit flags take precedence. Never silently fall back to another account.

Clients execute `pnpm exec dotenv -e .env -- iracing-data-mcp serve` from
the repository root. After publication, install
`@iracing-data/iracing-data-mcp@next` and execute `iracing-data-mcp serve`.
The executable never loads `.env`; copy [the example](../../../.env.example)
without overwriting user configuration and use an external loader.

Set `IRACING_AUTH_CLIENT` and, for confidential registrations,
`IRACING_AUTH_SECRET` to the original registration. `IRACING_ACCESS_TOKEN`
is an explicit alternative that bypasses file-backed restoration.
The command validates options at startup but reads credentials on demand.
The OAuth client owns refresh and persistence. Use only one refresh owner
per credential document. Logs belong on stderr; stdout belongs to MCP.
The shared `createTokenProvider` takes an injected `sessionStore` and explicit
`sessionKey`. It propagates restoration failures without logging. The document
store loads once; restart the MCP process after replacing the document.

Both transports accept the same `services` contract. Compose it with
`createMcpServices(createFetchQueries(tokenProvider))`, retaining that lazy query
owner and token-provider lifecycle across requests. Query getters instantiate
only the selected adapters, once per owner; they do not cache token values or
request context. See the app's composition tests for these lifetime guarantees.

## HTTP

`iracing-data-mcp serve --transport http` serves `/mcp` on
`127.0.0.1:3000`; other routes return empty 404 responses. It uses the
host-selected account without authenticating callers. Do not expose this
development listener publicly or describe it as authenticated.

Embedding hosts use `createHttpTransport({services, serveOptions})` and forward
requests to `handler.fetch(request)` at their chosen path. They own caller
verification and account selection. `createMcpServices` composes explicit
services from selected capabilities; actor-based composition remains available.
Multi-user request-scope integration is deferred; the fixed query composition
does not require a DI container.

## Verification

Run the package build/tests, packaging smoke test, and `pnpm verify`.
Only perform live tool calls with available credentials when requested;
synthetic tests do not prove upstream authorization.
Do not restore OAuth ingress, JWT verification, Docker importers, or session
registries for onboarding.
