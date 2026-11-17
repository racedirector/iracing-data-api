---
name: add-mcp-tool
description: Add an iRacing MCP tool with a tool-local Zod schema, a narrow service contract, direct registration, and an injected implementation.
---

# Add an iRacing MCP tool

Read [repository guidance](../../../AGENTS.md),
[MCP package guidance](../../../packages/mcp/AGENTS.md), and
[runtime guidance](../../../apps/iracing-data-mcp/AGENTS.md).
Use the current source and its `AGENTS.md` instructions as authority.

## Existing examples

`get_my_driver` is the smallest example. Its
[handler](../../../packages/mcp/src/tools/get-my-driver/index.ts)
registers one explicit tool through the internal execution adapter.
`search_race_results` demonstrates explicit search scope, upstream chunk bounds,
and signed-link isolation. `get_recent_races` demonstrates bounded input,
customer-identity validation, and output projection in its
[handler](../../../packages/mcp/src/tools/get-recent-races/index.ts).

Each tool owns `schema.ts` and `service.ts` beside `index.ts`.
[register.ts](../../../packages/mcp/src/register.ts) explicitly names
the supported tools. Do not add a generic registry, dispatcher, gateway,
pagination engine, or dependency injection container to the MCP core.

## Tool contracts

Define strict Zod input and projected output schemas. Keep responses within
64 KiB and exclude credentials or unrelated upstream fields. The tool-local
`service.ts` defines domain operations, not generated client methods.

Use the internal `registerApplicationTool` adapter in `execution.ts` for the
schema boundary, safe failure conversion and MCP presentation. It parses input
before dependency effects and projects output before serialization. Keep wire
output schemas JSON-compatible and transformation-free; source normalization
belongs in operations or concrete adapters. The SDK still owns protocol dispatch
and final output validation.

Keep capability selection explicit in `execute`, forward the request signal,
and put business rules in the tool-local `operation.ts`. Operations accept parsed
input and narrow query capabilities, returning the existing `Result` union with
typed failure descriptors; they never build MCP envelopes. Do not add middleware,
configurable presenters or automatic service selection without a concrete need.

## Host implementations

`@iracing-data/mcp` must not import Fetch, Axios, OAuth, or HTTP hosting.
The concrete [Fetch adapters](../../../apps/iracing-data-mcp/src/adapters)
belong to the runtime. They isolate signed HTTPS linked responses without
forwarding authorization headers or allowing redirects.

The CLI host reads its selected token document on demand; both the
[stdio adapter](../../../apps/iracing-data-mcp/src/transports/stdio/index.ts) and
[HTTP handler](../../../apps/iracing-data-mcp/src/transports/http/index.ts)
accepts host-selected services; authenticated embedding hosts own caller
verification and linked-account selection. Use
[explicit lazy composition](../../../apps/iracing-data-mcp/src/composition.ts)
to inject those capabilities. Retain query adapters and the token-provider
lifecycle per credential owner, not per request; never cache tokens or request
context in query getters. Never silently select the local CLI account
for an authenticated HTTP request. The standalone HTTP command is a separate,
unauthenticated loopback development mode using the host-selected account.

Do not restore OAuth resource-server routes, Docker credential importers,
session registries, or other deleted infrastructure without a separate
justified use case.

## Tests and verification

Update [MCP contract tests](../../../packages/mcp/test/boundaries.test.cjs),
[Fetch tests](../../../apps/iracing-data-mcp/test/adapters.test.cjs),
and [Hono tests](../../../apps/iracing-data-mcp/test/http.test.cjs)
when their respective contracts change.

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check:topology
pnpm check:service-client-boundary
pnpm --filter '@iracing-data/mcp...' build
pnpm --filter @iracing-data/mcp test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
pnpm verify
git diff --check
```

Changes to skills or `AGENTS.md` also require the manual
[agent regression scenarios](../../../agent-regressions/README.md).
Do not claim checks passed unless they ran. Never hand-edit generated code
or choose release versions merely because a tool changed; follow the reviewed
publication policy and [release procedure](../../../docs/RELEASING.md).
