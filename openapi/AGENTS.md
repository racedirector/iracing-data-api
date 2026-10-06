# Generated OpenAPI contracts

Inherits [root guidance](../AGENTS.md). JSON and YAML here are derived artifacts; do not edit them directly.

## Canonical inputs

Zod schemas supply shapes and inferred types. The corresponding helper's `src` supplies authored paths, operation IDs, response mappings, security, and document metadata. Both inputs matter: the schema alone is not the entire OpenAPI contract. Correct the owning input and preserve stable public operation IDs unless the change intentionally breaks generated client APIs.

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

Data API contract changes then require `pnpm codegen:client:api` (Fetch, Axios, and Rust), followed by the builds in [TypeScript client guidance](../packages/api/client/AGENTS.md) and [Rust guidance](../crates/iracing-data-api-client/AGENTS.md). Those scripts read `iracing.json`. OAuth contract changes require `pnpm codegen:client:oauth:fetch`, which reads `oauth.json` and regenerates the wire-client subtree inside the existing `@iracing-data/oauth-client` package. The OAuth generated source is not a separate workspace or release unit; validate its authored facade and higher-level runtime consumers per [OAuth guidance](../packages/oauth/AGENTS.md).

Include the exact build/codegen commands and resulting artifacts in the PR. Run `pnpm verify:generated` to regenerate in isolation and compare committed output. `pnpm codegen` uses the same path with output replacement. Inspect changes before committing; do not conflate formatter churn with semantic changes.
