# @iracing-data/oauth-schema-to-openapi

Generate OpenAPI definitions for the iRacing OAuth 2.0 API from Zod schemas.

## Repository setup

This is private workspace tooling. From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/oauth-schema-to-openapi...' build
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

The helper exports `document` (also available as the default export). Importing it
creates the OpenAPI document without writing files or logging. File writing and
format selection belong to the CLI; programmatic consumers choose their own
serialization and destination.

```typescript
import fs from "node:fs";
import { stringify } from "yaml";
import { document } from "@iracing-data/oauth-schema-to-openapi";

fs.mkdirSync("./dist", { recursive: true });
fs.writeFileSync("./dist/openapi.json", JSON.stringify(document));
fs.writeFileSync("./dist/openapi.yaml", stringify(document));
```

Consumers of the former `generateOpenAPISpec` export should use `document` and
write it themselves, or invoke the CLI with the existing output/format options.
Filesystem errors are reported by the CLI; correct the output path or directory
permissions and rerun the command.

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).

## Source navigation

[Document mapping](src/index.ts) owns endpoint and generated-description provenance;
[CLI](src/cli.ts) owns serialization/filesystem output. The authored runtime
[lifecycle](../../oauth/client/src/client.ts) owns OAuth processing and sessions.
