# iracing-data-api

A monorepo of TypeScript packages for working with the iRacing Data API and its OAuth authentication flow, plus a generated Rust client. Packages cover Zod validation schemas, OpenAPI generation, generated HTTP clients (Fetch and Axios), an OAuth client, and a Better Call router.

## Which package should I use?

- Call the iRacing Data API: start with [@iracing-data/api-client-fetch](packages/api/client/fetch/README.md).
- Authenticate and refresh tokens: add [@iracing-data/oauth-client](packages/oauth/client/README.md).
- Validate data or use types only: choose [@iracing-data/api-schema](packages/api/schema/README.md).
- Prefer Axios: use [@iracing-data/api-client-axios](packages/api/client/axios/README.md).

## Packages

### API

- [@iracing-data/api-schema](packages/api/schema/README.md) – Zod schemas for `/data` endpoints.
- [@iracing-data/api-schema-to-openapi](packages/helpers/api-schema-to-openapi/README.md) – Generate OpenAPI specs from the schemas.
- [@iracing-data/api-client-fetch](packages/api/client/fetch/README.md) – Fetch-based API client.
- [@iracing-data/api-client-axios](packages/api/client/axios/README.md) – Axios-based API client.
- [@iracing-data/api-router](packages/api/router/README.md) – Better Call router bundling generated `/data` routes.

### OAuth

- [@iracing-data/oauth-schema](packages/oauth/schema/README.md) – OAuth request/response Zod schemas.
- [@iracing-data/oauth-schema-to-openapi](packages/helpers/oauth-schema-to-openapi/README.md) – OpenAPI generation from OAuth schemas.
- [@iracing-data/oauth-client](packages/oauth/client/README.md) – OAuth client implementation.

## Rust

- [iracing-data-api-client](crates/iracing-data-api-client/README.md) – Generated Rust client for the iRacing `/data` API. Run the member lookup example with `cargo run --example get_member -- --access-token "$IRACING_ACCESS_TOKEN" --customer-ids 378767 --include-licenses`.

## Examples

See [examples/README.md](./examples/README.md).

## Development

This repo uses [pnpm](https://pnpm.io/) for dependency management:

```bash
pnpm install
```

Use `pnpm --filter <package>` to run scripts for a specific workspace package or example. See each linked README for package-specific instructions. Read [repository guidance](AGENTS.md) and its scoped guides for canonical source/generated ownership, dependency-aware codegen commands, and current verification entrypoints.

### Verification

Run `pnpm verify` before opening a PR. CI uses the same command for authored formatting/lint, topology, TypeScript builds/tests, example compilation, generated client builds, and Rust checks. See [verification](docs/VERIFICATION.md) for focused commands and toolchain prerequisites.

### Workspace policy

Run `pnpm check:topology` to validate workspace membership, TypeScript references, publication classification, and the managed release set. Run `pnpm test:topology` to test the policy checker. CI runs both commands. See [workspace ownership and publication policy](docs/WORKSPACE-POLICY.md) before adding or changing a workspace.

### Codegen

OpenAPI specs are generated from the Zod schemas into `openapi/` as both JSON and YAML:

```bash
pnpm codegen:openapi
```

The generated specs feed the OpenAPI Generator, which produces the Fetch and Axios clients plus the Rust crate:

```bash
pnpm codegen:client
```

## Releasing

Published packages live under the `@iracing-data` scope on npm. Releases are automated via GitHub Actions and driven by a git tag. See [docs/RELEASING.md](docs/RELEASING.md) for step-by-step instructions.

### Generated client presentation

The Fetch and Axios generation scripts normalize package metadata and README introductions after OpenAPI Generator runs. Edit the files in [scripts/client-presentation](scripts/client-presentation), then run the corresponding `pnpm codegen:client:api:fetch` or `pnpm codegen:client:api:axios` command. Generated endpoint and model documentation remains below the introduction. For presentation-only updates, run `pnpm exec node scripts/normalize-client-presentation.js fetch` (or `axios`) and format the affected package manifest and README with `pnpm exec prettier --write`.
