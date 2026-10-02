# Generated TypeScript Data API clients

Inherits [root guidance](../../../AGENTS.md). Applies to both client subtrees; discover manifests instead of keeping another package list.

## Ownership

Client source, models, endpoint docs, and generator support files are derived from `openapi/iracing.json`. Fix contract problems in API schemas or the authored OpenAPI mappings first, following [OpenAPI guidance](../../../openapi/AGENTS.md). Fix generator behavior in `scripts/openapi-generator-*.sh`, `scripts/openapi-generator-ts-post-process.sh`, or `openapitools.json` rather than patching output.

README introductions and presentation metadata are authored in `scripts/client-presentation/{fetch,axios}.{md,json}` and applied by `scripts/normalize-client-presentation.js`. Generated endpoint/model documentation remains generator-owned. Manifest versions remain independent release decisions; normalization preserves generator-owned versions, scripts, dependencies, and entrypoints. Review those fields after generation and retain intended release/configuration changes explicitly.

## Regeneration and validation

After updating the Data API OpenAPI JSON, run the affected generator(s):

```bash
pnpm codegen:client:api:fetch
pnpm codegen:client:api:axios
pnpm --filter @iracing-data/api-client-fetch build
pnpm --filter @iracing-data/api-client-axios build
```

Scripts invoke the pinned OpenAPI Generator and TypeScript post-processing, then normalize presentation and apply the explicit generated Prettier configuration. npm versions are passed from current authored manifests, including in isolated generation. Java is required by OpenAPI Generator. Contract changes shared by clients require both commands and the [Rust regeneration](../../../crates/iracing-data-api-client/AGENTS.md).

For presentation-only changes, avoid full generation:

```bash
pnpm exec node scripts/normalize-client-presentation.js fetch
pnpm exec prettier --write packages/api/client/fetch/package.json packages/api/client/fetch/README.md
```

Substitute `axios` for the other client. Run `pnpm verify:generated` for isolated freshness validation. Inspect generated diffs for unrelated churn or stale files; do not delete authored guidance when cleaning generator output. Report exact commands. These packages have build/prepare scripts but no declared test scripts.
