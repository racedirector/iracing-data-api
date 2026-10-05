# Data API schemas

Inherits [root guidance](../../AGENTS.md). Generated SDKs have [additional guidance](client/AGENTS.md).

## Authored ownership

`schema/src` owns Zod request/response schemas, inferred types, and exports. Preserve wire field names, coercion, optionality, nullability, and validation semantics deliberately; compare upstream evidence before changing a public contract. Reuse existing shared primitives and inspect tests and exports when changing schemas.

## Validation and downstream updates

```bash
pnpm --filter @iracing-data/api-schema test
pnpm --filter '@iracing-data/api-schema...' build
```

For schema changes affecting OpenAPI, or edits to the authored OpenAPI mappings, follow [OpenAPI guidance](../../openapi/AGENTS.md): build the API generator, regenerate both API formats, then all three Data API SDKs and build affected consumers. Run root lint/style for TypeScript changes.
