# iracing-data-mcp guidance

Inherits [root guidance](../../AGENTS.md). This workspace is a private `internal-tool` owned by the `api` area in [`workspace-policy.json`](../../workspace-policy.json); it is not an npm release target.

The app is an agent-facing adapter over the maintained Data API and OAuth packages. Follow [Data API guidance](../../packages/api/AGENTS.md), [generated client guidance](../../packages/api/client/AGENTS.md), and [OAuth guidance](../../packages/oauth/AGENTS.md) for their owned surfaces. Do not duplicate or hand-edit generated Data API contracts in this app. App-local Zod schemas are appropriate only for MCP-specific narrowing, projection, or composition.

Keep long-lived OAuth/Data API dependencies behind `McpServices`. Build a fresh MCP server for request-scoped protocol handling and register tools against the injected shared services. Transport handlers, browser OAuth routes, durable-session wiring, gateway behavior, error policy, Docker packaging, and concrete tools belong to their owning implementation slices rather than this workspace skeleton.

Do not introduce telemetry support, hosted/multi-user authorization, arbitrary Data API proxy tools, or application-to-application imports. Use the generated Fetch client directly rather than `@iracing-data/api-router`.

Validate changes with the package build/tests plus the repository topology, impact, and verification commands described in [verification guidance](../../docs/VERIFICATION.md). Private app changes do not authorize or require a public npm version bump.
