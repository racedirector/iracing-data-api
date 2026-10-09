# iracing-data-mcp guidance

Inherits [root guidance](../../AGENTS.md). Inspect [`workspace-policy.json`](../../workspace-policy.json) and this workspace manifest for ownership and publication eligibility.

The app is an agent-facing adapter over the maintained Data API and OAuth packages. Follow [Data API guidance](../../packages/api/AGENTS.md), [generated client guidance](../../packages/api/client/AGENTS.md), and [OAuth guidance](../../packages/oauth/AGENTS.md) for their owned surfaces. Do not duplicate or hand-edit generated Data API contracts in this app. App-local Zod schemas are appropriate only for MCP-specific narrowing, projection, or composition.

Inspect [services](src/services.ts), [session ownership](src/session.ts),
[HTTP lifecycle](src/http.ts), and [tool registration](src/tools/identity-content.ts)
before changing composition. The full source map is in [architecture navigation](architecture.md).
Preserve the characterized protocol/recovery contracts when moving boundaries.

The local startup/onboarding contract is also consumed by the [repo-local MCP onboarding skill](../../.agents/skills/iracing-data-mcp-onboarding/SKILL.md). Any change to local prerequisites, `.env` keys, OAuth/login flow, Docker/Compose startup, credential import/storage, health checks, recovery commands, or MCP-client connection instructions must update that skill and its deterministic scripts in the same change. Keep the skill orchestration aligned with [the local Docker guide](local-container.md); do not let it invent a parallel startup path.

Do not introduce telemetry support, hosted/multi-user authorization, arbitrary Data API proxy tools, or application-to-application imports. Use the generated Fetch client directly rather than `@iracing-data/api-router`.

Validate changes with the package build/tests plus the repository topology, impact, and verification commands described in [verification guidance](../../docs/VERIFICATION.md). Changes to this `AGENTS.md` or the repo-local onboarding skill also require the manual [agent regression scenarios](../../agent-regressions/README.md) before review; CI validates only their structure and references, not model behavior. Private app changes do not authorize or require a public npm version bump.
