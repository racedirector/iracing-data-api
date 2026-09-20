# @iracing-data/api-schema

Zod schemas and TypeScript types for iRacing Data API requests and responses.

## Installation

```bash
pnpm add @iracing-data/api-schema
```

## Usage

```typescript
import { IRacingGetCarResponseSchema } from "@iracing-data/api-schema";

const result = IRacingGetCarResponseSchema.parse(apiResponse);
```

Use the schemas directly for runtime validation or feed them into helpers like `@iracing-data/api-schema-to-openapi` for OpenAPI generation.

## Development

```bash
pnpm --filter @iracing-data/api-schema test
```

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API router](https://www.npmjs.com/package/@iracing-data/api-router): Better Call server routes.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.
