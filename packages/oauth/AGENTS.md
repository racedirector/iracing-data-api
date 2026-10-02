# OAuth schemas and authored runtime client

Inherits [root guidance](../../AGENTS.md).

## Ownership and behavior

`schema/src` owns shared OAuth wire schemas, inferred types, literals, headers, and exported contract shapes. `client/src` owns runtime requests, query/form encoding, token parsing, error handling, state/session storage, refresh, masking, and JWT utilities. The client consumes and re-exports the schema package; it is hand-authored and is not generated from `openapi/oauth.json`.

Keep raw protocol acceptance separate from dependency-normalized values and convenience JWT APIs. Inspect `oauth4webapi`/`jose` boundary behavior when relevant. Preserve error information, absent/null distinctions, state/PKCE handling, refresh rotation, and storage semantics intentionally. Tests must avoid real credentials or live authentication. Compare protocol changes against current official evidence; the repository compatibility-audit skill supports research but does not authorize unrelated public API mutations.

Endpoint/method/content-type mappings for OAuth OpenAPI are authored in `../helpers/oauth-schema-to-openapi/src`. Schema or mapping changes that affect the contract require both OAuth OpenAPI formats, following [OpenAPI guidance](../../openapi/AGENTS.md). Runtime-only client changes do not require codegen. Review affected examples and README claims when runtime behavior or public exports change.

## Validation

```bash
pnpm --filter '@iracing-data/oauth-schema...' build
pnpm --filter '@iracing-data/oauth-client...' build
```

Run root lint/style for TypeScript edits and declared tests for affected packages. The OAuth client declares offline Node tests against its built authored runtime: run `pnpm --filter @iracing-data/oauth-client test` after building it and its dependencies. These tests use synthetic credentials and intercept Fetch; they do not exercise live iRacing authentication or JWT signature verification. The schema package does not currently declare a test script. Add focused offline tests when changing high-risk runtime behavior, and report coverage limits. Discover example package names and build scripts from their manifests before running affected example builds. Versions are independent; use the release guide to assess schema/client release order.
