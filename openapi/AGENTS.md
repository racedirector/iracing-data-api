# Generated OpenAPI contracts

Inherits [root guidance](../AGENTS.md). JSON and YAML here are derived artifacts; do not edit them directly.

## Canonical inputs

Inspect the [Data API document owner](../packages/helpers/api-schema-to-openapi/src/index.ts)
or [OAuth document owner](../packages/helpers/oauth-schema-to-openapi/src/index.ts) and their
imported schemas. Those inputs own shapes, endpoint mapping and description provenance.
Preserve public operation IDs deliberately. [Freshness orchestration](../scripts/check-generated.mjs)
owns generation ordering and replacement boundaries.

## Regeneration from the repository root

Build the relevant helper and its dependencies first so its CLI reads current compiled inputs:

```bash
# Data API branch:
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
# OAuth branch:
pnpm --filter '@iracing-data/oauth-schema-to-openapi...' build
pnpm codegen:openapi:oauth
pnpm codegen:openapi:oauth:yaml
```

Run only affected branches. `pnpm codegen:openapi` runs both branches/formats but does not build the helpers. Inspect JSON and YAML for the same intended contract change. Generation is not proof of upstream correctness or reproducibility.

Data API contract changes then require `pnpm codegen:client:api` (Fetch, Axios, and Rust), followed by the builds in [TypeScript client guidance](../packages/api/client/AGENTS.md) and [Rust guidance](../crates/iracing-data-api-client/AGENTS.md). Those scripts read `iracing.json`; there is currently no OAuth SDK generation edge. For OAuth output, validate the authored schema/runtime consumers per [OAuth guidance](../packages/oauth/AGENTS.md).

Include the exact build/codegen commands and resulting artifacts in the PR. Run `pnpm verify:generated` to regenerate in isolation and compare committed output. `pnpm codegen` uses the same path with output replacement. Inspect changes before committing; do not conflate formatter churn with semantic changes.
