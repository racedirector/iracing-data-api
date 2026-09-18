# @iracing-data/api-schema-to-openapi

Generate an OpenAPI definition from the Zod schema used by the `/data` API.

## Installation

```bash
pnpm add -D @iracing-data/api-schema-to-openapi
```

## Usage

### CLI

```bash
# JSON (default), or inferred from a .yaml/.yml extension
iracing-api-openapi -f openapi.json -o ./dist
iracing-api-openapi -f openapi.yaml -o ./dist
iracing-api-openapi -f spec.yml -o ./dist

# Force a format regardless of the file extension
iracing-api-openapi -f spec.yaml --format json -o ./dist
```

`--format <json|yaml>` overrides extension inference; it must be one of `json` or `yaml`.

### Programmatically

```typescript
import { generateOpenAPISpec } from "@iracing-data/api-schema-to-openapi";

// JSON (default), inferred from the fileName extension
await generateOpenAPISpec({
  fileName: "openapi.json",
  outputDir: "./dist",
});

// YAML via the .yaml extension, or explicitly via the format option
await generateOpenAPISpec({
  fileName: "openapi.yaml",
  outputDir: "./dist",
});

await generateOpenAPISpec({
  fileName: "openapi.json",
  outputDir: "./dist",
  format: "yaml",
});
```

The generator consumes schemas from `@iracing-data/api-schema` and writes an OpenAPI document for client generation and documentation.
