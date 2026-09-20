# @iracing-data/oauth-schema-to-openapi

Generate OpenAPI definitions for the iRacing OAuth 2.0 API from Zod schemas.

## Installation

```bash
pnpm add -D @iracing-data/oauth-schema-to-openapi
```

## Usage

### CLI

```bash
# JSON (default), or inferred from a .yaml/.yml extension
iracing-oauth-api-openapi -f openapi.json -o ./dist
iracing-oauth-api-openapi -f openapi.yaml -o ./dist
iracing-oauth-api-openapi -f spec.yml -o ./dist

# Force a format regardless of the file extension
iracing-oauth-api-openapi -f spec.yaml --format json -o ./dist
```

`--format <json|yaml>` overrides extension inference; it must be one of `json` or `yaml`.

### Programmatically

```typescript
import { generateOpenAPISpec } from "@iracing-data/oauth-schema-to-openapi";

// JSON (default), inferred from the fileName extension
await generateOpenAPISpec({
  fileName: "openapi-oauth.json",
  outputDir: "./dist",
});

// YAML via the .yaml extension, or explicitly via the format option
await generateOpenAPISpec({
  fileName: "openapi-oauth.yaml",
  outputDir: "./dist",
});

await generateOpenAPISpec({
  fileName: "openapi-oauth.json",
  outputDir: "./dist",
  format: "yaml",
});
```

The generator reads the schemas from `@iracing-data/oauth-schema` and outputs an OpenAPI file suitable for tooling and documentation.

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API router](https://www.npmjs.com/package/@iracing-data/api-router): Better Call server routes.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.
