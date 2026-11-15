---
name: add-mcp-tool
description: Add an iRacing MCP tool with explicit tool-local Zod contracts, a narrow injected service interface, direct MCP registration and a consumer-owned adapter.
---

# Add or extend an iRacing MCP tool

Read [root guidance](../../../AGENTS.md),
[MCP package guidance](../../../packages/mcp/AGENTS.md),
[reference host guidance](../../../apps/iracing-data-mcp/AGENTS.md)
and the owning sources first. Follow [verification](../../../docs/VERIFICATION.md)
and inspect package manifests for actual scripts.

## Two intentionally explicit examples

- [get_my_driver/index.ts](../../../packages/mcp/src/tools/get-my-driver/index.ts)
  is the smallest example: no arguments, one query method, projection, direct
  `server.registerTool`, request-local capability selection, and sanitized failures.
- [get_recent_races/index.ts](../../../packages/mcp/src/tools/get-recent-races/index.ts)
  demonstrates strict optional arguments, a bounded result, source-identity
  verification and output normalization without a generic pagination engine.
- Each tool's `schema.ts` owns the input, projection, and output; `service.ts`
  owns the smallest transport-independent capability contract.
- [register.ts](../../../packages/mcp/src/register.ts) explicitly lists tools;
  [factory.ts](../../../packages/mcp/src/factory.ts) creates an *unconnected*
  server using that registrar. Never introduce a second catalog.

## Define the complete tool contract

1. State the behavior and boundaries. Add `schema.ts` beside the tool using
   Zod; strict input prevents accidental secrets or unexpected arguments.
   Project only allowed output fields, with a 64 KiB total response cap.
2. Declare the **operations the tool requires** in adjacent `service.ts`.
   Name real operations (for example `getRecent`); accept `AbortSignal` and
   return domain-specific typed data. Do not expose SDK `Configuration`, tokens,
   Fetch, Axios, MCP SDK types, or a generic gateway in this interface.
3. In `index.ts`, directly call `server.registerTool` with metadata, schemas
   and annotations. In its callback, explicitly:
   - create request context from the SDK signal and host-verified auth info
   - validate input *before* accessing any injected capability
   - abort early, check that the host provided the required selector
   - resolve the capability using the request context
   - call the capability with validated arguments and cancellation
   - validate/project the output and enforce its size
   - catch and return a sanitized `toolError` with an owned request ID
4. Reuse tiny shared primitives such as
   [input.ts](../../../packages/mcp/src/input.ts),
   [result.ts](../../../packages/mcp/src/result.ts), and
   [diagnostics/errors.ts](../../../packages/mcp/src/diagnostics/errors.ts).
   **Do not reintroduce `execution.ts`, a `ToolDefinition` descriptor,
   generic tool invoker, resolver registry, or generalized dispatch pipeline.**
   Some repeated lines between the two tools are intentional: reviewers should
   see all decision points and dependency interactions in each handler.
5. Add only the intended tool to
   [register.ts](../../../packages/mcp/src/register.ts); both factory-owned
   and caller-owned servers use the same list.

## Implement the concrete data source in the consumer

The MCP package **does not choose Fetch or Axios**, create an OAuth owner,
or expose generated SDK configuration. A consumer implements the tool-local
service interface with an adapter; the reference host has
[driver](../../../apps/iracing-data-mcp/src/adapters/driver.ts),
[recent races](../../../apps/iracing-data-mcp/src/adapters/recent-races.ts),
and [safe linked-response](../../../apps/iracing-data-mcp/src/adapters/linked-response.ts)
Fetch adapters. Other consumers may use Axios, fixtures, or another data source.

For local stdio, the [credential adapter](../../../apps/iracing-data-mcp/src/credentials.ts)
reads the CLI's dedicated token document on demand. The
[Fetch factory](../../../apps/iracing-data-mcp/src/adapters/fetch.ts)
constructs the concrete clients. For HTTP, the
[mountable Hono router](../../../apps/iracing-data-mcp/src/http.ts)
receives a host-verified actor and the actor's query capabilities.
[Awilix composition](../../../apps/iracing-data-mcp/src/composition.ts)
connects these capabilities to the two tool-local service selectors.
The MCP core knows only the service interfaces.

Keep signed HTTPS links in concrete adapters, with no bearer/cookie
forwarding and redirects rejected. Preserve abort signals. Do not
introduce an OAuth resource server, a separate refresh owner,
an MCP session registry, or a generalized execution framework.

## Tests and review

- Use [package contract tests](../../../packages/mcp/test/boundaries.test.cjs)
  with in-memory MCP transport and synthetic service implementations that need
  no generated client or credential. Prove direct registration, validation
  before effects, output projection, bounded results and sanitized failures.
- Add [Fetch adapter tests](../../../apps/iracing-data-mcp/test/adapters.test.cjs)
  covering token isolation, safe signed links, upstream error mapping and
  cancellation.
- Add [Hono router tests](../../../apps/iracing-data-mcp/test/http.test.cjs)
  verifying that anonymous callers are denied before resolving capabilities,
  that verified actors get their own providers, and that outputs are projected.
- Use [configuration tests](../../../apps/iracing-data-mcp/test/config.test.cjs)
  and a local stdio smoke when changes affect the executable. No live
  iRacing account is required for synthetic verification.

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check:topology
pnpm check:service-client-boundary
pnpm --filter '@iracing-data/mcp...' build
pnpm --filter @iracing-data/mcp test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
pnpm --filter @iracing-data/cli test
pnpm verify
pnpm impact --base main
git diff --check
```

Changes to skills or `AGENTS.md` also require the manual
[agent regression scenarios](../../../agent-regressions/README.md).
Do not claim unavailable checks passed. Do not hand-edit generated code,
change public release versions, add listeners to the MCP package, or
introduce speculative infrastructure.

The app supports both
[stdio](../../../apps/iracing-data-mcp/src/stdio.ts) and a
[mountable Hono HTTP router](../../../apps/iracing-data-mcp/src/http.ts)
using the official MCP SDK. New tools do not add HTTP routes, token
refresh infrastructure, or session state. Update the tool-local
contract and concrete adapter instead.
