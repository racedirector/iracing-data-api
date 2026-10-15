# Historical schema symbol migration

The additive migration introduced shorter canonical schema names while retaining historical imports. This is a historical record, not a pending release plan. Current package versions and publication status belong to manifests and registries.

For new code, remove the leading `IRacing` prefix and retain `OAuth` in OAuth names; use canonical `OAuthCallbackParametersSchema` spelling. Existing imports continue to work:

```typescript
// Historical import remains available.
import { IRacingCustomerIdSchema } from "@iracing-data/api-schema";
// Preferred for new code.
import { CustomerIdSchema } from "@iracing-data/api-schema";
```

Read the [API export owner](../packages/api/schema/src/index.ts) and [OAuth export owner](../packages/oauth/schema/src/index.ts) for the alias compatibility contract. No data conversion is needed to adopt canonical imports. Removal requires a separate breaking-release decision.

The complete historical map is the frozen [export fixture](../tests/schema-compatibility/exports.json), not another manually maintained table. [Compatibility tests](../tests/schema-compatibility/compatibility.test.cjs), [behavior characterization](../tests/schema-compatibility/characterization.test.cjs) and [type witnesses](../tests/schema-compatibility/types.ts) own provenance, immutability and enforcement.

Run `pnpm test:schema-compatibility` after its required dependency builds, or use the schema package's declared test script. Follow [current verification](VERIFICATION.md) and [release procedures](RELEASING.md) for new work; historical proposed versions and one-time generation results do not authorize a release.

## Intentional linked-payload removals

Commit `9afb118` removed `GetCarAssetsResponseSchema`, `GetCarResponseSchema`,
`GetTrackAssetsResponseSchema`, `GetTrackResponseSchema`, their inferred types,
and their historical `IRacing` aliases. These described downloaded link content,
not the `/data` response envelope. Consumers must validate that content using
application-owned schemas; MCP uses its car/track projections. The `/data`
`APIResponseSchema` envelope remains available.

This is a breaking change to schema-package imports. The frozen historical
fixtures remain intact; [explicit exceptions](../tests/schema-compatibility/retained-exports.cjs)
exclude only these removed pairs from retention checks. All other aliases retain
the original compatibility guarantees. These removals do not change the OpenAPI
mapping or generated SDKs and require no regeneration.
