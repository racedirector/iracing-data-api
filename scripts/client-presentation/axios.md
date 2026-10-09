# @iracing-data/api-client-axios

Typed Axios client for the iRacing Data API, generated from maintained OpenAPI schemas.

Access cars, tracks, members, results, seasons, leagues, stats, and other iRacing Data API resources with typed methods and responses. Choose this client when your application already uses Axios.

## Installation

```bash
pnpm add @iracing-data/api-client-axios
```

## Authentication and usage

Obtain an iRacing OAuth 2.0 access token with [@iracing-data/oauth-client](https://www.npmjs.com/package/@iracing-data/oauth-client), then pass it as a bearer token. The API client does not perform login or refresh tokens; provide a current token for each session. Keep client secrets on your server.

```typescript
import { CarApi, Configuration } from "@iracing-data/api-client-axios";

const api = new CarApi(
  new Configuration({ accessToken: process.env.IRACING_ACCESS_TOKEN! }),
);
const response = (await api.getCar()).data;
```

This Node.js example uses an access token from the environment. Some Data API endpoints return a link to the resource data; follow that link separately without forwarding your bearer token.

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).
