# @iracing-data/oauth-schema-to-openapi

Generate an OpenAPI document from the Zod-based iRacing OAuth schema.

## Installation

```bash
pnpm add -D @iracing-data/oauth-schema-to-openapi
```

## Usage

### CLI

```bash
iracing-oauth-api-openapi -f openapi.json -o ./dist
```

### Programmatically

```typescript
import { generateOpenAPISpec } from "@iracing-data/oauth-schema-to-openapi";

await generateOpenAPISpec({
  fileName: "openapi-oauth.json",
  outputDir: "./dist",
});
```

The generator reads the schemas from `@iracing-data/oauth-schema` and outputs an OpenAPI file suitable for tooling and documentation.
