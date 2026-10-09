# Data API schemas

Inherits [root guidance](../../AGENTS.md). Generated SDKs have [additional guidance](client/AGENTS.md).

## Authored ownership

Inspect [primitives](schema/src/schema/primitives.ts), [parameters](schema/src/schema/parameters.ts),
[responses](schema/src/schema/responses.ts), and the authored [document mapping](../helpers/api-schema-to-openapi/src/index.ts).
Their module documentation owns composition, wire interpretation and generated-description provenance.
Require official evidence and deliberate public compatibility review for contract changes.
Use existing tests/exports; never patch derived artifacts.

## Validation and downstream updates

```bash
pnpm --filter @iracing-data/api-schema test
pnpm --filter '@iracing-data/api-schema...' build
```

For schema changes affecting OpenAPI, or edits to the authored OpenAPI mappings, follow [OpenAPI guidance](../../openapi/AGENTS.md): build the API generator, regenerate both API formats, then all three Data API SDKs and build affected consumers. Run root lint/style for TypeScript changes.
