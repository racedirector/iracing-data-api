# OAuth schemas and authored runtime client

Inherits [root guidance](../../AGENTS.md).

## Ownership and behavior

Inspect [wire schemas](schema/src/schema.ts), [scope codec](schema/src/scopes.ts),
[lifecycle](client/src/client.ts), [durable storage](client/src/storage/token-document-store.ts),
[error interpretation](client/src/errors/oauth.ts), and [protocol/JWT utilities](client/src/utils.ts).
Module documentation owns protocol/runtime boundaries and security-sensitive invariants.
Current runtime is authored, not generated. OpenAPI mapping belongs to the
[OAuth helper](../helpers/oauth-schema-to-openapi/src/index.ts).

Compare protocol changes against current official evidence; preserve raw wire acceptance
separately from dependency-normalized values. Use offline synthetic credentials and inspect
consumer examples/apps for public impact. Runtime-only edits require no codegen;
contract/mapping edits follow [OpenAPI commands](../../openapi/AGENTS.md).

## Validation

```bash
pnpm --filter '@iracing-data/oauth-schema...' build
pnpm --filter '@iracing-data/oauth-client...' build
```

Run root lint/style for TypeScript edits and declared tests for affected packages. The OAuth client declares offline Node tests against its built authored runtime: run `pnpm --filter @iracing-data/oauth-client test` after building it and its dependencies. These tests use synthetic credentials and intercept Fetch; they do not exercise live iRacing authentication or JWT signature verification. The schema manifest declares its compatibility test entry point; inspect that script and build requirements before running it. Add focused offline tests when changing high-risk runtime behavior, and report coverage limits. Discover example package names and build scripts from their manifests before running affected example builds. Versions are independent; use the release guide to assess schema/client release order.
