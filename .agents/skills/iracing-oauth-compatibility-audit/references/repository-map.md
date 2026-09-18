# Repository map

This map records the layout observed on 2026-09-18. It is a navigation aid, not a substitute for inspecting the current working tree.

## Tooling and ownership

- The repository is a pnpm 12 monorepo (`package.json`, `pnpm-workspace.yaml`). Use pnpm and scoped package commands.
- `packages/oauth/schema` publishes `@iracing-data/oauth-schema`. Its `src/schema.ts` is the canonical shared representation of OAuth wire data: Zod schemas, inferred TypeScript types, literals, headers, token/JWT shapes, profile/session responses, and revocation inputs.
- `packages/oauth/client` publishes `@iracing-data/oauth-client`. It depends on and re-exports `@iracing-data/oauth-schema`; therefore dependency direction is client -> schema. It owns runtime requests, encoding, state/session storage, refresh behavior, masking, JWT utilities, and consumer-facing errors.
- `packages/helpers/oauth-schema-to-openapi` consumes the schema package to build the OAuth OpenAPI description. `openapi/oauth.json` is checked-in generated output and is a downstream compatibility surface, not the primary source.

## High-value files and symbols

### Schema package

- `packages/oauth/schema/src/schema.ts`
  - authorize/callback/token request schemas;
  - token and error response schemas;
  - scope literals/string representation;
  - JWT header/payload schemas and algorithm literals;
  - profile, sessions, and revocation schemas;
  - inferred public types.
- `packages/oauth/schema/src/index.ts`: package export surface.
- `packages/oauth/schema/README.md`: public usage claims.

### Client package

- `packages/oauth/client/src/client.ts`
  - `OAuthClient` metadata setup;
  - `authorize`, `callback`, `passwordLimitedAuthorization`, and `refresh`;
  - token/profile response handling;
  - session persistence, restoration, refresh rotation, and protected requests;
  - access-token parsing/validation entry points.
- `packages/oauth/client/src/schema/oauth.ts`
  - default endpoint constants and client metadata constraints;
  - requestable-scope array.
- `packages/oauth/client/src/utils.ts`
  - `maskSecret`;
  - JWT decode, remote-JWKS verification, claims validation;
  - access/refresh expiration helpers.
- `packages/oauth/client/src/errors/*.ts`: callback, refresh, claims, and metadata errors.
- `packages/oauth/client/src/schema/store.ts` and `src/storage/*`: stored token/state shapes and implementations.
- `packages/oauth/client/src/index.ts`: re-exports schema, client, errors, and storage.
- `packages/oauth/client/src/errors/oauth.test.ts`: currently observed OAuth-focused unit tests.
- `packages/oauth/client/README.md`: public behavior and usage.

### Other contract consumers

- `packages/helpers/oauth-schema-to-openapi/src/index.ts`: endpoint/method/content-type/OpenAPI mapping.
- `openapi/oauth.json`: generated contract; compare after its source schemas/generator.
- `examples/oauth-example`, `examples/oauth-example-cli`, and `examples/oauth-password-limited`: consumer expectations and flows.
- Root scripts `codegen:openapi:oauth`, `lint`, `style`, and `test` are relevant only if implementation is explicitly requested.

## Search seeds

Do not limit the audit to these terms. Useful initial searches include:

```text
OAuth|authorize|authorization|token|refresh|password_limited
PKCE|challenge|verifier|mask|secret|scope
revoke|session|profile|RateLimit|Retry-After|x-request-id
jwt|jku|jwks|claim|aud|issuer|error|URLSearchParams|form-urlencoded
```

Check git history for relevant symbols and paths before describing a mismatch as an upstream change or intentional design.
