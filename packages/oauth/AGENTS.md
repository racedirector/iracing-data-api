# OAuth schemas and runtime clients

Inherits [root guidance](../../AGENTS.md).

## Ownership and behavior

`schema/src` owns shared OAuth wire schemas, inferred types, literals, headers, and exported contract shapes. `client/src/generated` is generator-owned wire-client source derived from `openapi/oauth.json`; do not edit it by hand. The rest of `client/src` is authored code in the same `@iracing-data/oauth-client` release unit.

`OAuthApiClient` is the lightweight application-facing iRacing OAuth API boundary. Generated code owns ordinary endpoint URLs, bearer headers, form/query serialization, Fetch invocation, status/content-type handling, and response-schema parsing. `OAuthClient` remains the higher-level OAuth service/orchestration abstraction for state and PKCE lifecycle, token protocol processing, session storage/restoration, refresh-token rotation, and protected Data API requests. Keep `oauth4webapi` protocol validation where it adds OAuth semantics rather than replacing it solely for uniformity.

Keep raw protocol acceptance separate from dependency-normalized values and convenience JWT APIs. Inspect `oauth4webapi`/`jose` boundary behavior when relevant. Preserve error information, absent/null distinctions, state/PKCE handling, refresh rotation, and storage semantics intentionally. Tests must avoid real credentials or live authentication. Compare protocol changes against current official evidence; the repository compatibility-audit skill supports research but does not authorize unrelated public API mutations.

Endpoint/method/content-type mappings for OAuth OpenAPI are authored in `../helpers/oauth-schema-to-openapi/src`. Schema or mapping changes that affect the contract require both OAuth OpenAPI formats and regeneration of `client/src/generated`, following [OpenAPI guidance](../../openapi/AGENTS.md). Run root codegen rather than hand-editing generated artifacts. Review affected examples and README claims when runtime behavior or public exports change.

## Validation

```bash
pnpm codegen
pnpm --filter '@iracing-data/oauth-schema...' build
pnpm --filter '@iracing-data/oauth-client...' build
```

Run root lint/style for TypeScript edits and declared tests for affected packages. The OAuth client declares offline Node tests against its built runtime: run `pnpm --filter @iracing-data/oauth-client test` after building it and its dependencies. These tests use synthetic credentials and intercepted Fetch; they do not exercise live iRacing authentication or JWT signature verification. The schema package does not currently declare a test script. Add focused offline tests when changing high-risk runtime behavior, and report coverage limits. Discover example package names and build scripts from their manifests before running affected example builds. Versions are independent; use the release guide to assess schema/client release order.
