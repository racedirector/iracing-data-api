# @iracing-data/api-schema-to-openapi

Generate an OpenAPI definition from the Zod schema used by the `/data` API.

## Installation

```bash
pnpm add -D @iracing-data/api-schema-to-openapi
```

## Usage

### CLI

```bash
iracing-api-openapi -f openapi.json -o ./dist
```

### Programmatically

```typescript
import { generateOpenAPISpec } from "@iracing-data/api-schema-to-openapi";

await generateOpenAPISpec({
  fileName: "openapi.json",
  outputDir: "./dist",
});
```

The generator consumes schemas from `@iracing-data/api-schema` and writes an OpenAPI document for client generation and documentation.
