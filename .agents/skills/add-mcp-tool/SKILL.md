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
registers the tool directly. `get_recent_races` demonstrates bounded input,
customer-identity validation, and output projection in its
[handler](../../../packages/mcp/src/tools/get-recent-races/index.ts).

Each tool owns `schema.ts` and `service.ts` beside `index.ts`.
[register.ts](../../../packages/mcp/src/register.ts) explicitly names
the supported tools. Do not add a generic registry, executor, gateway,
pagination engine, or dependency injection container to the MCP core.

## Tool contracts

Define strict Zod input and projected output schemas. Keep responses within
64 KiB and exclude credentials or unrelated upstream fields. The tool-local
`service.ts` defines domain operations, not generated client methods.

Register directly with the SDK. Each handler validates its input before
accessing services, resolves the request-local capability, forwards the
`AbortSignal`, validates and projects output, and sanitizes errors.
Small shared primitives in `input.ts`, `result.ts`, and `diagnostics/errors.ts`
are reusable. Duplicated control flow between the two tools is intentional.

## Host implementations

`@iracing-data/mcp` must not import Fetch, Axios, OAuth, or HTTP hosting.
The concrete [Fetch adapters](../../../apps/iracing-data-mcp/src/adapters)
belong to the runtime. They isolate signed HTTPS linked responses without
forwarding authorization headers or allowing redirects.

The [stdio adapter](../../../apps/iracing-data-mcp/src/stdio.ts)
reads the CLI's dedicated MCP token document on demand. The
[Hono router](../../../apps/iracing-data-mcp/src/http.ts)
requires the embedding host to verify every actor and resolve that actor's
linked iRacing capabilities. Use
[Awilix composition](../../../apps/iracing-data-mcp/src/composition.ts)
to inject those capabilities; never silently select the local CLI account
for an HTTP request.

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
or change public release versions as part of this private MCP work.
