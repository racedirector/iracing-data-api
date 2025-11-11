# @iracing-data/api-schema-to-openapi-schema

Helper function to generate OpenAPI (Swagger) spec from [iRacing API zod schema](../../api-schema/).

## Installation

```sh
$ pnpm add -D @iracing/data/api-schema-to-openapi
```

## Usage

### CLI

```sh
$ iracing-api-openapi -f openapi.json -o ~/Desktop
```

### Programmatically

```ts
import { generateOpenAPISpect } from "@iracing-data/api-schema-to-openapi";

await generateOpenAPISpec({
  fileName: "openapi.json",
  outputDir: "~/Desktop",
});

console.log("Output schema to", path.join(output, file));
```
