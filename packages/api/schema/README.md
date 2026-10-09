# @iracing-data/api-schema

Zod schemas and TypeScript types for iRacing Data API requests and responses.

## Installation

```bash
pnpm add @iracing-data/api-schema
```

## Usage

```typescript
import { GetCarResponseSchema } from "@iracing-data/api-schema";

const result = GetCarResponseSchema.parse(apiResponse);
```

Use the schemas directly for runtime validation or feed them into helpers like `@iracing-data/api-schema-to-openapi` for OpenAPI generation.

## Current documentation and query inputs

`ServicesDocsResponseSchema` accepts methods that omit `parameters` and preserves method `note` as a string or string array. Consumers must treat `parameters` as optional:

```typescript
import {
  ServicesDocsResponseSchema,
  SeasonSpectatorSubsessionidsDetailParametersSchema,
  StatsMemberRecapParametersSchema,
} from "@iracing-data/api-schema";

const docs = ServicesDocsResponseSchema.parse(documentation);
const parameters = docs.car.get.parameters ?? {};
const filters = SeasonSpectatorSubsessionidsDetailParametersSchema.parse({
  event_types: [2, 5],
  season_ids: [513, 937],
});
const recap = StatsMemberRecapParametersSchema.parse({ year: "2026" });
```

Spectator filters are typed arrays: `event_types` accepts the existing numeric IDs `2 | 3 | 4 | 5`, and `season_ids` accepts numbers. Pass arrays to schema validation and generated clients; the request layer serializes them as one comma-separated query value. The [authored mapping](../../helpers/api-schema-to-openapi/src/index.ts) owns their OpenAPI serialization. Empty arrays fail schema validation; omit an optional filter to use the server default.

Boolean query parameters accept native booleans and the exact strings `"true"`/`"false"`. `"false"` now parses as false; arbitrary strings, numbers and null fail validation instead of being converted by JavaScript truthiness. Correct an invalid input using the field path in the Zod error. Recap `year` accepts calendar-year numbers and numeric strings; omission retains the upstream default.

`ConstantsResponseSchema` describes a direct array of objects for the three constants endpoints. It preserves object fields without assuming their detailed contract. Generated clients now return that array instead of a cache-link envelope. The time-trial operations retain their existing method names while requesting `/data/stats/season_tt_results` and `/data/stats/season_tt_standings`.

These corrections require migrating code that assumes documentation parameters always exist or expects a cache-link response from constants endpoints. Schema and SDK packages remain independently versioned; release the schema before affected SDKs.

## Development

```bash
pnpm --filter @iracing-data/api-schema test
```

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).

## Schema naming compatibility

Canonical schema exports omit the leading `IRacing` and retain `OAuth` where present. All historical schema names remain as deprecated aliases with identical values and equivalent types, including OAuth-client re-exports. See the [complete migration map and compatibility policy](../../../docs/SCHEMA-MIGRATION.md).

## Source navigation

[Primitives](src/schema/primitives.ts) own shared acceptance/coercion;
[parameters](src/schema/parameters.ts) own endpoint inputs;
[responses](src/schema/responses.ts) own response composition and coverage limits.
[Document mapping](../../helpers/api-schema-to-openapi/src/index.ts) owns endpoints
and descriptions feeding generated clients/docs. See [generation checks](../../../scripts/check-generated.mjs)
for authored/generated boundaries and deterministic freshness.
