# @iracing-data/api-schema-to-openapi

Generate OpenAPI JSON or YAML for the iRacing Data API from maintained Zod schemas.

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

The helper exports `document` (also available as the default export). Importing it
creates the OpenAPI document without writing files or logging. File writing and
format selection belong to the CLI; programmatic consumers choose their own
serialization and destination.

```typescript
import fs from "node:fs";
import { stringify } from "yaml";
import { document } from "@iracing-data/api-schema-to-openapi";

fs.mkdirSync("./dist", { recursive: true });
fs.writeFileSync("./dist/openapi.json", JSON.stringify(document));
fs.writeFileSync("./dist/openapi.yaml", stringify(document));
```

Consumers of the former `generateOpenAPISpec` export should use `document` and
write it themselves, or invoke the CLI with the existing output/format options.
Filesystem errors are reported by the CLI; correct the output path or directory
permissions and rerun the command.

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.
