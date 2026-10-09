# @iracing-data/oauth-schema

Zod schemas and TypeScript types for the iRacing OAuth 2.0 API.

## Installation

```bash
pnpm add @iracing-data/oauth-schema
```

## Usage

```typescript
import { OAuthAuthorizeParametersSchema } from "@iracing-data/oauth-schema";

const parsed = OAuthAuthorizeParametersSchema.parse({
  client_id: "example-client",
  redirect_uri: "https://example.com/callback",
  response_type: "code",
});
```

Review [src/schema.ts](src/schema.ts) for the full list of exported schemas that describe request parameters, headers, error responses, and the decoded JWT access token shape used by the OAuth flow.

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).

## Schema naming compatibility

Canonical schema exports omit the leading `IRacing` and retain `OAuth` where present. All historical schema names remain as deprecated aliases with identical values and equivalent types, including OAuth-client re-exports. See the [complete migration map and compatibility policy](../../../docs/SCHEMA-MIGRATION.md).

## Source navigation

[Wire schema ownership](src/schema.ts), [scope codec](src/scopes.ts), and the
[OpenAPI mapping](../../helpers/oauth-schema-to-openapi/src/index.ts) describe
protocol and authored/generated boundaries beside their implementation.
