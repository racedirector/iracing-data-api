# @iracing-data/oauth-schema-to-openapi

Generate an OpenAPI document from the Zod-based iRacing OAuth schema.

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
