---
name: add-mcp-tool
description: Define or extend iRacing MCP tools with tool-local input/output schemas, narrow service contracts, explicit host injection, generated Data API adapters, and synthetic contract tests. Use for changes in packages/mcp tools.
---

# Add or extend an iRacing MCP tool

Read [root guidance](../../../AGENTS.md), [MCP package scope](../../../packages/mcp/AGENTS.md),
[reference-host scope](../../../apps/iracing-data-mcp/AGENTS.md), and the actual
source. This skill is for **tool definition and composition**, not the OAuth
onboarding workflow. Use the [verification procedure](../../../docs/VERIFICATION.md)
and the current package manifests for executable checks.

## Existing implementation to follow

- [get_my_driver](../../../packages/mcp/src/tools/get-my-driver/index.ts) owns
  its registered tool name/description, input/output binding, validated handler,
  and service selection.
- Its [schema](../../../packages/mcp/src/tools/get-my-driver/schema.ts) owns the
  strict input schema, projection and result type. Its
  [service](../../../packages/mcp/src/tools/get-my-driver/service.ts) declares
  only the operations the handler needs. Do not define tool dependencies in a
  central domain-wide provider catalog.
- Its [adapter](../../../packages/mcp/src/tools/get-my-driver/adapter.ts)
  implements the service using the generated SDK. It is separate from the
  handler, imported by the consumer through the package's explicit export.
- [register.ts](../../../packages/mcp/src/register.ts) is the explicit list of
  registered tools; [factory.ts](../../../packages/mcp/src/factory.ts) and the
  lower-level registrar both use that same list.
- [services.ts](../../../packages/mcp/src/services.ts) defines the narrow host
  selectors, and [execution.ts](../../../packages/mcp/src/execution.ts) owns
  sanitized validation and MCP result/error handling.
- [session.ts](../../../apps/iracing-data-mcp/src/session.ts) composes host
  credentials, domain adapters and access selection; [http.ts](../../../apps/iracing-data-mcp/src/http.ts)
  owns MCP transport, session lifetime and cancellation.

These are navigation references, **not a template to split every small tool into
four files**. A simple tool can remain in one module. Group `index.ts`,
`schema.ts`, `service.ts` and an adapter when real responsibilities require it.

## Define the tool's complete contract

1. Identify the requested capability, existing tool and consumers. Inspect
   [register.ts](../../../packages/mcp/src/register.ts) for current names.
   Avoid adding a duplicate endpoint tool or migrating unrelated tools.
2. Define input and projected output using Zod next to the owning tool. Choose
   strict input for no-argument tools, validate before selecting services or
   making effects, and project only the intended public fields. Reuse established
   primitives and MCP error/result helpers. Canonical upstream modeled schemas
   remain in [Data API](../../../packages/api/AGENTS.md); do not copy them into
   MCP or hand-edit generated code.
3. Declare the handler's **required operations** beside the tool, in a
   tool-local `service.ts` when injection is needed (as FTR Discord commands do).
   Make the interface transport-agnostic and narrow: named methods, argument
   shapes (including `AbortSignal`), and typed returns. Do not make it aware of
   the MCP SDK, credentials, generated client configuration, request metadata
   or a generic resolver. Export a type needed by a consumer through
   [index.ts](../../../packages/mcp/src/index.ts) only when useful.
4. Implement a tool handler that translates validated MCP arguments into
   service calls and returns the existing structured/text result contract.
   Describe the tool, register its schemas and retain correct annotations.
   `registerTool` handles invalid-input, output-validation and sanitized
   failures. For an injected capability, use its request-local selector; do
   not resolve generated access first or construct the adapter in the handler.
5. Add the tool to the explicit [registration list](../../../packages/mcp/src/register.ts).
   The listener-free factory registers that list; do not add a second catalog,
   file-discovery system, registration decorator or server singleton.

## Implement and bind effects

A consumer constructs or selects concrete implementations and passes them
through the narrow `IracingToolServices` selector. It may use verified ingress
identity to select a principal; tool handlers do not infer identity from claims.
Use explicit factories/constructors, not Awilix, service locators, generic
gateways or a provider registry.

For modeled Data API requests, use the generated Fetch SDK in the **concrete
adapter**, not handwritten endpoint calls. Inject an asynchronous access-token
provider (refresh/persistence remain in the host) and any HTTP fetch
implementation. Reuse [linked-response](../../../packages/mcp/src/linked-response.ts)
for signed HTTPS responses; never forward bearer credentials or other inherited
headers to opaque links, permit unsafe schemes/embedded credentials, or follow
redirects. Propagate cancellation into generated and linked requests. Do not
duplicate OAuth owners or create credential caches in the package.

The seven unmigrated tools currently use `getDataApiAccess(context)` and
stable, opaque continuation scopes. Leave them alone unless the issue asks for
their migration. Keep the existing 5-minute, 32-entry, 32-MiB and MCP response
limits; do not add a generic request pipeline, new caching framework, or
transport lifecycle.

## Prove the contract

Add focused synthetic tests under [package tests](../../../packages/mcp/test)
and host tests under [host tests](../../../apps/iracing-data-mcp/test) only
where composition changes.

- In-memory MCP client discovers the registered tool and calls it, including
  strict invalid-input rejection before dependency effects.
- Inject a fake tool-local service; assert exact structured/text projection,
  service invocation, sanitized validation failures, and no unexpected
  generated-client/credential/network access.
- For a generated adapter, prove lazy token acquisition, correct upstream
  authorization, **no bearer on linked fetch**, HTTPS/redirect safety,
  cancellation, nonleaking 401/network/data errors and account isolation.
- Check the reference host's sessionful protocol, optional registrations,
  OAuth refresh/quarantine, ingress authorization and shutdown when touched.
  Preserve existing tools' input/output/continuation contracts.

Run the actual manifest commands from the repository root, starting with:

```sh
pnpm install --frozen-lockfile
pnpm check:topology
pnpm check:service-client-boundary
pnpm --filter '@iracing-data/mcp...' build
pnpm --filter @iracing-data/mcp test
pnpm --filter '@iracing-data/iracing-data-mcp...' build
pnpm --filter @iracing-data/iracing-data-mcp test
pnpm verify
pnpm impact --base main
git diff --check
```

For a change to repository guidance or skills, follow
[agent regressions](../../../agent-regressions/README.md): fixture validation
does not establish the five manual agent evaluations. Do not claim skipped
checks, Docker, or live upstream tests passed. Describe what was run and the
limitations; do not publish or modify generated packages for an MCP-only tool.
