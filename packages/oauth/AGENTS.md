# OAuth schemas and runtime clients

Inherits [root guidance](../../AGENTS.md).

## Ownership and behavior

`schema/src` owns shared OAuth wire schemas, inferred types, literals, headers, and exported contract shapes. `client/generated` is the generator-owned `@iracing-data/oauth-client-fetch` workspace produced directly from `openapi/oauth.json`; do not edit it by hand. `client/src` is authored `@iracing-data/oauth-client` code and depends on that generated workspace through the normal pnpm workspace edge.

`OAuthApiClient` is the authored application-facing adapter over `@iracing-data/oauth-client-fetch`. The generated package owns ordinary endpoint URLs, bearer headers, form/query serialization, Fetch invocation, and generated response models. The adapter may add runtime schema validation, request policy, safe error normalization, and protocol-specific bridges, but it must not reconstruct endpoint requests already represented by the generated client. `OAuthClient` remains the higher-level OAuth service/orchestration abstraction for state and PKCE lifecycle, token protocol processing, session storage/restoration, refresh-token rotation, and protected Data API requests. Keep `oauth4webapi` protocol validation where it adds OAuth semantics rather than replacing it solely for uniformity.

Keep raw protocol acceptance separate from dependency-normalized values and convenience JWT APIs. Inspect `oauth4webapi`/`jose` boundary behavior when relevant. Preserve error information, absent/null distinctions, state/PKCE handling, refresh rotation, and storage semantics intentionally. Tests must avoid real credentials or live authentication. Compare protocol changes against current official evidence; the repository compatibility-audit skill supports research but does not authorize unrelated public API mutations.

Endpoint/method/content-type mappings for OAuth OpenAPI are authored in `../helpers/oauth-schema-to-openapi/src`. Schema or mapping changes that affect the contract require both OAuth OpenAPI formats and regeneration of `client/generated`, following [OpenAPI guidance](../../openapi/AGENTS.md). Run root codegen rather than hand-editing generated artifacts. Review affected examples and README claims when runtime behavior or public exports change.
Inspect [wire schemas](schema/src/schema.ts), [scope codec](schema/src/scopes.ts),
[lifecycle](client/src/client.ts), [durable storage](client/src/storage/token-document-store.ts),
[error interpretation](client/src/errors/oauth.ts), and [protocol/JWT utilities](client/src/utils.ts).
Module documentation owns protocol/runtime boundaries and security-sensitive invariants.
The lifecycle runtime is authored; the low-level wire client is generated. OpenAPI mapping belongs to the
[OAuth helper](../helpers/oauth-schema-to-openapi/src/index.ts).

Compare protocol changes against current official evidence; preserve raw wire acceptance
separately from dependency-normalized values. Use offline synthetic credentials and inspect
consumer examples/apps for public impact. Runtime-only edits require no codegen;
contract/mapping edits follow [OpenAPI commands](../../openapi/AGENTS.md).

## Validation

```bash
pnpm codegen
pnpm --filter '@iracing-data/oauth-schema...' build
pnpm --filter '@iracing-data/oauth-client-fetch...' build
pnpm --filter '@iracing-data/oauth-client...' build
```

Run root lint/style for TypeScript edits and declared tests for affected packages. The OAuth client declares offline Node tests against its built authored runtime: run `pnpm --filter @iracing-data/oauth-client test` after building it and its dependencies. These tests use synthetic credentials and intercept Fetch; they do not exercise live iRacing authentication or JWT signature verification. The schema manifest declares its compatibility test entry point; inspect that script and build requirements before running it. Add focused offline tests when changing high-risk runtime behavior, and report coverage limits. Discover example package names and build scripts from their manifests before running affected example builds. Versions are independent; use the release guide to assess schema/generated-client/client release order.
