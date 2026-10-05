# @iracing-data/api-router

Better Call router for the iRacing Data API using typed clients and Zod schemas.

## Installation

```bash
pnpm add @iracing-data/api-router
```

## Usage

```typescript
import createRouter, { toNodeHandler } from "@iracing-data/api-router";

const router = createRouter();
const handler = toNodeHandler(router);

// handler can be mounted in http.createServer or frameworks that accept Node handlers
```

The package re-exports the generated fetch client and middleware helpers so you can compose routes or mount them alongside other services.

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API router](https://www.npmjs.com/package/@iracing-data/api-router): Better Call server routes.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.

## Corrected query and time-trial behavior

Time-trial routes use `/data/stats/season_tt_results` and `/data/stats/season_tt_standings`, matching the official documentation. The exported handler names remain `seasonTimeTrialResults` and `seasonTimeTrialStandings`. Callers of the former `/data/stats/season_time_trial_*` paths must update their URLs.

Spectator filters use comma-separated query values, for example `event_types=2,3&season_ids=513,937`. Boolean query strings `true` and `false` retain their intended values; unsupported values fail query validation. `stats/member_recap?year=2026` accepts calendar years. These behaviors have deterministic offline schema, mapping and consumer tests; they do not imply live coverage of every endpoint.
