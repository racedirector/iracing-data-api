# Fetch-first Data API call

Start with an existing iRacing OAuth bearer token that permits Data API access. Use Node.js 24 with built-in Fetch. Install the recommended package in your application:

```bash
pnpm add @iracing-data/api-client-fetch
```

Provide `IRACING_ACCESS_TOKEN` through your environment or secret manager, without the `Bearer ` prefix. Keep tokens out of source control. This example uses `DocApi.getDocs()` to request `/data/doc` and print the whole documentation JSON, grouped by service and method. The documentation is returned directly; method links describe API endpoints and do not need to be fetched to retrieve the documentation.

Save the following as `first-call.ts` in a TypeScript application and run it with your TypeScript runner:

```typescript
import { DocApi, Configuration } from "@iracing-data/api-client-fetch";

async function main() {
  const accessToken = process.env.IRACING_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error(
      "Set IRACING_ACCESS_TOKEN in .env or your environment to an existing bearer token.",
    );

  const api = new DocApi(new Configuration({ accessToken }));
  const docs = await api.getDocs();
  console.log(JSON.stringify(docs, null, 2));
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

On success, the example prints the complete documentation JSON. A failed Data API request reports its HTTP status and exits unsuccessfully; 401/403 calls for checking token validity, scope, and account access. The example does not log the bearer token.

## Run the repository example

From the repository root, install the pinned toolchain/dependencies as described in [verification](../../docs/VERIFICATION.md), then:

```bash
pnpm --filter 'iracing-data-api-first-call...' build
cp examples/data-api-first-call/.env.example examples/data-api-first-call/.env
# Fill in IRACING_ACCESS_TOKEN in examples/data-api-first-call/.env.
pnpm --filter iracing-data-api-first-call start
```

The `start` script uses Node’s built-in `--env-file-if-exists=.env` support to load `.env` from the example directory. Copy `.env.example` once, fill in your token without the `Bearer ` prefix, and run `start`. The local `.env` is ignored by Git. Existing environment variables take precedence; `.env` is optional if you already supply the token through your environment. If neither provides a token, the example reports how to set it and exits unsuccessfully. This executes [the same source shown above](src/index.ts) against the live API. No token is needed for `pnpm --filter iracing-data-api-first-call test`: offline fixtures verify the single authenticated documentation request, complete output, and error handling. Compilation participates in `pnpm verify:examples`; offline tests participate in the declared workspace tests in `pnpm verify:js`.

## Need a token?

The shortest repository-native path is [`apps/iracing-data-cli`](../../apps/iracing-data-cli/README.md): configure a registered iRacing OAuth client, build the private CLI, and run `iracing-data auth login` to obtain the complete token response. Copy only its `access_token` value into this example's `.env` as `IRACING_ACCESS_TOKEN`; do not add a `Bearer ` prefix. The CLI intentionally does not edit this `.env` file for you.

For upstream requirements, see iRacing's current [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html) and [client registration documentation](https://oauth.iracing.com/oauth2/book/client_registration.html). For reusable application integration rather than the repository CLI, see the [OAuth client package](../../packages/oauth/client/README.md) and [OAuth examples](../README.md).
