# @iracing-data/api-schema

Zod schemas and TypeScript types for iRacing Data API requests and responses.

## Installation

```bash
pnpm add @iracing-data/api-schema
```

## Usage

```typescript
import { APIResponseSchema } from "@iracing-data/api-schema";

const result = APIResponseSchema.parse(apiResponse);
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

Semantic numeric primitives separate domain values from query conversion. For example, `SubsessionIdSchema` accepts numbers, while `SubsessionIdParameterSchema` also accepts numeric strings. The same split covers league/season, car/track, team, race-week and numeric enum concepts. `SeasonIdSchema` and `LeagueSeasonIdSchema` describe distinct concepts even though both currently accept numbers.

```typescript
import {
  SubsessionIdParameterSchema,
  RaceWeekNumParameterSchema,
  SimSessionNumberParameterSchema,
} from "@iracing-data/api-schema";

SubsessionIdParameterSchema.parse("42"); // 42
RaceWeekNumParameterSchema.parse("0"); // 0
SimSessionNumberParameterSchema.parse("-1"); // -1
SubsessionIdParameterSchema.safeParse("   ").success; // false
```

These query adapters reject blank or nonnumeric strings and non-query values such as null, booleans and arrays. Correct the field identified in the Zod error; omit an optional filter instead of sending an empty string. Team IDs accept numeric strings consistently across result searches. The legacy `CustomerIdSchema` retains its existing coercion behavior, including blank-to-zero conversion. Comma-separated ID filters and typed spectator arrays retain their existing serialization.

Query conversion preserves the existing OpenAPI and generated-client contract: EventType and Division retain named enum references. CategoryId and ChartType query schemas retain their historical numeric wire projection while validating enum values at runtime. No SDK migration is required for this primitive refactor.

`ConstantsResponseSchema` describes a direct array of objects for the three constants endpoints. It preserves object fields without assuming their detailed contract. Generated clients now return that array instead of a cache-link envelope. The time-trial operations retain their existing method names while requesting `/data/stats/season_tt_results` and `/data/stats/season_tt_standings`.

These corrections require migrating code that assumes documentation parameters always exist or expects a cache-link response from constants endpoints. Schema and SDK packages remain independently versioned; release the schema before affected SDKs.

## Development

```bash
pnpm --filter @iracing-data/api-schema test
```

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).

## Schema naming compatibility

Canonical schema exports omit the leading `IRacing` and retain `OAuth` where present. Except for the removed linked-payload contracts documented in the migration policy, historical schema names remain as deprecated aliases with identical values and equivalent types, including OAuth-client re-exports. See the [complete migration map and compatibility policy](../../../docs/SCHEMA-MIGRATION.md).

## Source navigation

[Primitives](src/schema/primitives.ts) own shared acceptance/coercion;
[parameters](src/schema/parameters.ts) own endpoint inputs;
[responses](src/schema/responses.ts) own response composition and coverage limits.
[Document mapping](../../helpers/api-schema-to-openapi/src/index.ts) owns endpoints
and descriptions feeding generated clients/docs. See [generation checks](../../../scripts/check-generated.mjs)
for authored/generated boundaries and deterministic freshness.
