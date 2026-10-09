# @iracing-data/api-client-fetch

Typed Fetch client for the iRacing Data API, generated from maintained OpenAPI schemas.

Access cars, tracks, members, results, seasons, leagues, stats, and other iRacing Data API resources with typed methods and responses. The recommended starting point for general API usage; requires Node.js or another runtime providing Fetch.

## Installation

```bash
pnpm add @iracing-data/api-client-fetch
```

## First Data API call

Start with an existing bearer token and follow the [canonical Fetch-first quickstart and runnable example](https://github.com/racedirector/iracing-data-api/tree/main/examples/data-api-first-call#readme). It configures `DocApi` with `Configuration({ accessToken })` and calls `getDocs()` to retrieve the whole documentation map. The example prints JSON and handles HTTP failures.

The client requires a runtime providing Fetch, such as Node.js 24. It does not acquire or refresh tokens. For that separate step, see [the OAuth client](https://github.com/racedirector/iracing-data-api/tree/main/packages/oauth/client#readme) and the official [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html) and [client registration requirements](https://oauth.iracing.com/oauth2/book/client_registration.html).

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).
