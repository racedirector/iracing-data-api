# iRacing `/data` API (TypeSpec)

This example ports a small slice of the `/data` API schema into [TypeSpec](https://microsoft.github.io/typespec/). It mirrors
structures from `@iracing-data/api-schema` and the OpenAPI generator in `@iracing-data/api-schema-to-openapi`, but uses TypeSpec's
native emitters to produce OpenAPI definitions.

## Getting started

Install dependencies and compile the TypeSpec project:

```bash
pnpm install
pnpm --filter @examples/iracing-typespec build
```

The included `tspconfig.yaml` is configured to emit OpenAPI v3.1 JSON into `./dist/iracing.typespec.openapi.json`.

## Project layout

- `main.tsp` &mdash; The TypeSpec surface area that maps `/data` endpoints to operations.
- `tspconfig.yaml` &mdash; Configures the OpenAPI emitter and lints with the standard HTTP/REST rules.
- `package.json` &mdash; Declares the TypeSpec toolchain dependencies.
