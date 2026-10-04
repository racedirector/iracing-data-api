# iracing-data-api

A monorepo of TypeScript packages for working with the iRacing Data API and its OAuth authentication flow, plus a generated Rust client. Packages cover Zod validation schemas, OpenAPI generation, generated HTTP clients (Fetch and Axios), an OAuth client, and a Better Call router.

## Which package should I use?

- Call the iRacing Data API: start with [@iracing-data/api-client-fetch](packages/api/client/fetch/README.md).
- Authenticate and refresh tokens: add [@iracing-data/oauth-client](packages/oauth/client/README.md).
- Validate data or use types only: choose [@iracing-data/api-schema](packages/api/schema/README.md).
- Prefer Axios: use [@iracing-data/api-client-axios](packages/api/client/axios/README.md).

## First Data API call

With an existing bearer token, follow the [Fetch-first quickstart](examples/data-api-first-call/README.md): install `@iracing-data/api-client-fetch`, set `IRACING_ACCESS_TOKEN`, call `CarApi.getCar()`, and fetch the returned cached-data link without forwarding authorization. The runnable example prints the cars JSON and reports HTTP failures. [Token acquisition and refresh](packages/oauth/client/README.md) are a separate step.

## OpenAPI contracts

| Contract | JSON                                 | YAML                                 | Package/runtime surface                                                                                                                                |
| -------- | ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data API | [iracing.json](openapi/iracing.json) | [iracing.yaml](openapi/iracing.yaml) | iRacing `/data` endpoints; input to the generated Fetch, Axios, and Rust clients.                                                                      |
| OAuth    | [oauth.json](openapi/oauth.json)     | [oauth.yaml](openapi/oauth.yaml)     | iRacing Auth Service requests/responses shared with the OAuth schemas and authored OAuth client. The OAuth client is not generated from this contract. |

Use these contracts to inspect operations and authentication, import into API tooling, or generate an external client. For tools requiring a URL, use the raw [Data API JSON](https://raw.githubusercontent.com/racedirector/iracing-data-api/main/openapi/iracing.json) or [OAuth JSON](https://raw.githubusercontent.com/racedirector/iracing-data-api/main/openapi/oauth.json). Main tracks the current repository contract; pin a commit when reproducible external generation matters, rather than assuming independently versioned packages share a release.

The JSON/YAML files are generated artifacts. Maintained inputs are the [Data API Zod schemas](packages/api/schema/src) and [endpoint mappings](packages/helpers/api-schema-to-openapi/src), and the [OAuth Zod schemas](packages/oauth/schema/src) and [endpoint mappings](packages/helpers/oauth-schema-to-openapi/src). Change those inputs rather than editing OpenAPI output. [Deterministic verification](docs/VERIFICATION.md) checks both formats and downstream Data API clients for freshness. These repository contracts describe maintained coverage; generation alone does not verify live upstream behavior.

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

### Issues and triage

Before creating or triaging backlog work, see [issue triage and prioritization](docs/ISSUE-TRIAGE.md). Use GitHub's native Issue Type for work classification, assign the smallest accurate set of `area:*` labels, and assign exactly one `priority:P0`–`priority:P3` label. Use native blocked-by/blocking issue relationships for prerequisites; reserve `status:*` for exceptional lifecycle information such as ready-to-close.

### Verification

Run `pnpm verify` before opening a PR. CI uses the same command for authored formatting/lint, topology, TypeScript builds/tests, example compilation, generated-output freshness/client builds, and Rust checks. See [verification](docs/VERIFICATION.md) for focused commands and toolchain prerequisites.

### Workspace policy

Run `pnpm check:topology` to validate workspace membership, TypeScript references, publication classification, and the managed release set. Run `pnpm test:topology` to test the policy checker. CI runs both commands. See [workspace ownership and publication policy](docs/WORKSPACE-POLICY.md) before adding or changing a workspace.

### Codegen

OpenAPI specs are generated from the Zod schemas into `openapi/` as both JSON and YAML:

```bash
pnpm codegen:openapi
```

The generated Data API spec feeds OpenAPI Generator, which produces the Fetch and Axios clients plus the Rust crate:

```bash
pnpm codegen:client
```

For full dependency-aware regeneration and stale-file cleanup, run `pnpm codegen`. Run `pnpm verify:generated` to regenerate all four OpenAPI specs and three clients in isolation and compare their committed output without changing local artifacts. Java 17 and the pinned Rust toolchain are required. See [verification](docs/VERIFICATION.md).

## Releasing

Published packages live under the `@iracing-data` scope on npm. Releases are automated via GitHub Actions and driven by a git tag. See [docs/RELEASING.md](docs/RELEASING.md) for step-by-step instructions.

### Generated client presentation

The Fetch and Axios generation scripts normalize package metadata and README introductions after OpenAPI Generator runs. Edit the files in [scripts/client-presentation](scripts/client-presentation), then run the corresponding `pnpm codegen:client:api:fetch` or `pnpm codegen:client:api:axios` command. Generated endpoint and model documentation remains below the introduction. For presentation-only updates, run `pnpm exec node scripts/normalize-client-presentation.js fetch` (or `axios`) and format the affected package manifest and README with `pnpm exec prettier --write`.

Rust crate presentation is maintained in `scripts/client-presentation/rust.json` and `rust.md`. Regeneration preserves authored Cargo dependency/build/version settings and Rust examples, while applying the presentation overlay and workspace lint inheritance.
