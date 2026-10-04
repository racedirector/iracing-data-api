# @iracing-data/api-client-fetch

Typed Fetch client for the iRacing Data API, generated from maintained OpenAPI schemas.

Access cars, tracks, members, results, seasons, leagues, stats, and other iRacing Data API resources with typed methods and responses. The recommended starting point for general API usage; requires Node.js or another runtime providing Fetch.

## Installation

```bash
pnpm add @iracing-data/api-client-fetch
```

## First Data API call

Start with an existing bearer token and follow the [canonical Fetch-first quickstart and runnable example](https://github.com/racedirector/iracing-data-api/tree/main/examples/data-api-first-call#readme). It configures `CarApi` with `Configuration({ accessToken })`, calls `getCar()`, and fetches the returned cached-data link without forwarding the token. The example prints JSON and handles HTTP failures.

The client requires a runtime providing Fetch, such as Node.js 24. It does not acquire or refresh tokens. For that separate step, see [the OAuth client](https://github.com/racedirector/iracing-data-api/tree/main/packages/oauth/client#readme) and the official [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html) and [client registration requirements](https://oauth.iracing.com/oauth2/book/client_registration.html).

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API router](https://www.npmjs.com/package/@iracing-data/api-router): Better Call server routes.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.
