# Generated TypeScript Data API clients

Inherits [root guidance](../../../AGENTS.md). Applies to both client subtrees; discover manifests instead of keeping another package list.

## Ownership

Inspect [generation/freshness ownership](../../../scripts/check-generated.mjs),
[Fetch](../../../scripts/openapi-generator-fetch.sh)/[Axios](../../../scripts/openapi-generator-axios.sh)
wrappers, and the [presentation normalizer](../../../scripts/normalize-client-presentation.js).
Source, models, endpoint docs and generator bookkeeping are derived; do not hand-edit them.
Contract changes belong to [schema/mapping owners](../../helpers/api-schema-to-openapi/src/index.ts).
Presentation inputs are `scripts/client-presentation/{fetch,axios}.{md,json}`.
Release versions remain authored decisions: inspect regeneration and retain reviewed intent.

## Regeneration and validation

After updating the Data API OpenAPI JSON, run the affected generator(s):

```bash
pnpm codegen:client:api:fetch
pnpm codegen:client:api:axios
pnpm --filter @iracing-data/api-client-fetch build
pnpm --filter @iracing-data/api-client-axios build
```

The linked wrappers own generator options, post-processing and manifest version preservation. Java is required by OpenAPI Generator. Contract changes shared by clients require both commands and the [Rust regeneration](../../../crates/iracing-data-api-client/AGENTS.md).

For presentation-only changes, avoid full generation:

```bash
pnpm exec node scripts/normalize-client-presentation.js fetch
pnpm exec prettier --write --config scripts/generated.prettier.json --ignore-path scripts/generated.prettierignore packages/api/client/fetch/package.json packages/api/client/fetch/README.md
```

Substitute `axios` for the other client. Run `pnpm verify:generated` for isolated freshness validation. Inspect generated diffs for unrelated churn or stale files; do not delete authored guidance when cleaning generator output. Report exact commands. These packages have build/prepare scripts but no declared test scripts.
