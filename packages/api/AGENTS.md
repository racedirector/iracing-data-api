# Data API schemas and router

Inherits [root guidance](../../AGENTS.md). Generated SDKs have [additional guidance](client/AGENTS.md).

## Authored ownership

`schema/src` owns Zod request/response schemas, inferred types, and exports. Preserve wire field names, coercion, optionality, nullability, and validation semantics deliberately; compare upstream evidence before changing a public contract. Reuse existing shared primitives and inspect tests and exports when changing schemas.

`router/src` is an authored, private Better Call runtime adapter consuming the schemas and generated Fetch client. Follow existing middleware and route helpers. Router behavior belongs here; endpoint descriptions used for generation belong in `../helpers/api-schema-to-openapi/src`, not in router files. A router-only change does not require codegen.

## Validation and downstream updates

```bash
pnpm --filter @iracing-data/api-schema test
pnpm --filter '@iracing-data/api-schema...' build
# For router changes (includes workspace dependencies):
pnpm --filter '@iracing-data/api-router...' build
```

For schema changes affecting OpenAPI, or edits to the authored OpenAPI mappings, follow [OpenAPI guidance](../../openapi/AGENTS.md): build the API generator, regenerate both API formats, then all three Data API SDKs and build affected consumers. Inspect router usage after a generated client API changes. Run root lint/style for TypeScript changes. The router currently has no declared test script; do not describe a build as runtime test coverage.
