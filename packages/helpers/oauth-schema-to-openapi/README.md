# @iracing-data/api-schema-to-openapi

Helper function to generate OpenAPI (Swagger) spec from [iRacing OAuth API zod schema](../../oauth/schema/).

## Installation

```sh
$ pnpm add -D @iracing/data/oauth-schema-to-openapi
```

## Usage

### CLI

```sh
$ iracing-oauth-api-openapi -f openapi.json -o ~/Desktop
```

### Programmatically

```ts
import { generateOpenAPISpect } from "@iracing-data/oauth-schema-to-openapi";

await generateOpenAPISpec({
  fileName: "openapi-oauth.json",
  outputDir: "~/Desktop",
});

console.log("Output schema to", path.join(output, file));
```
