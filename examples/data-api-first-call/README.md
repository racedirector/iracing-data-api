# Fetch-first Data API call

Start with an existing iRacing OAuth bearer token that permits Data API access. Use Node.js 24 with built-in Fetch. Install the recommended package in your application:

```bash
pnpm add @iracing-data/api-client-fetch
```

Provide `IRACING_ACCESS_TOKEN` through your environment or secret manager, without the `Bearer ` prefix. Keep tokens out of source control. This example requests `/data/car/get`, then fetches its cached JSON resource without forwarding the token. The client types the link envelope; the cached resource is JSON, not a generated car model.

Save the following as `first-call.ts` in a TypeScript application and run it with your TypeScript runner:

```typescript
import { CarApi, Configuration } from "@iracing-data/api-client-fetch";

async function main() {
  const accessToken = process.env.IRACING_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error("Set IRACING_ACCESS_TOKEN to an existing bearer token.");

  const api = new CarApi(new Configuration({ accessToken }));
  const response = await api.getCar();
  if (!response.link)
    throw new Error("The Data API did not return a cached-data link.");

  // Fetch cached data separately; do not forward the bearer token.
  const dataResponse = await fetch(response.link);
  if (!dataResponse.ok)
    throw new Error(`Cached data request failed: HTTP ${dataResponse.status}`);
  const cars: unknown = await dataResponse.json();
  console.log(JSON.stringify(cars, null, 2));
}

main().catch((error: unknown) => {
  if (
    error instanceof Error &&
    "response" in error &&
    error.response instanceof Response
  ) {
    console.error(
      `Data API request failed: HTTP ${error.response.status}. Check token validity, scope, and account access.`,
    );
  } else {
    console.error(
      error instanceof Error ? error.message : "Data API request failed.",
    );
  }
  process.exitCode = 1;
});
```

On success, the example prints the cars JSON. A failed Data API request reports its HTTP status and exits unsuccessfully; 401/403 calls for checking token validity, scope, and account access. Cached-data HTTP failures also exit unsuccessfully. The example does not log the bearer token.

## Run the repository example

From the repository root, install the pinned toolchain/dependencies as described in [verification](../../docs/VERIFICATION.md), then:

```bash
pnpm --filter 'iracing-data-api-first-call...' build
pnpm --filter iracing-data-api-first-call start
```

Set `IRACING_ACCESS_TOKEN` in the environment of that terminal before running `start`. This executes [the same source shown above](src/index.ts) against the live API. No token is needed for `pnpm --filter iracing-data-api-first-call test`: offline fixtures verify the request, response handling, and that cached-data requests omit authorization. Compilation participates in `pnpm verify:examples`; offline tests participate in the declared workspace tests in `pnpm verify:js`.

## Need a token?

Follow the current official [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html) and [client registration requirements](https://oauth.iracing.com/oauth2/book/client_registration.html). For token acquisition and refresh integration, see the separate [OAuth client](../../packages/oauth/client/README.md) and [OAuth examples](../README.md). This first-call path does not provision clients or refresh tokens.
