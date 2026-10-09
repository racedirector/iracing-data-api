# iracing-data-api

A monorepo of TypeScript packages for working with the iRacing Data API and its OAuth authentication flow, plus a generated Rust client. Packages cover Zod validation schemas, OpenAPI generation, generated HTTP clients (Fetch and Axios), and an OAuth client.

## Which package should I use?

- Call the iRacing Data API: start with [@iracing-data/api-client-fetch](packages/api/client/fetch/README.md).
- Authenticate and refresh tokens: add [@iracing-data/oauth-client](packages/oauth/client/README.md).
- Validate data or use types only: choose [@iracing-data/api-schema](packages/api/schema/README.md).
- Prefer Axios: use [@iracing-data/api-client-axios](packages/api/client/axios/README.md).
- Validate OAuth requests/responses: use [@iracing-data/oauth-schema](packages/oauth/schema/README.md).
- Use Rust: start with [iracing-data-api-client](crates/iracing-data-api-client/README.md) and its runnable member lookup example.

## Local MCP application

For bounded read-only agent queries, use the private [local Data API MCP](apps/iracing-data-mcp/README.md). Its [Docker setup and credential recovery](apps/iracing-data-mcp/local-container.md) use host CLI auth-only login and a loopback Streamable HTTP connection. It is separate from public npm package releases.

The [client connection guide](apps/iracing-data-mcp/clients.md) covers checked-in configurations for common AI clients, Ollama-backed OpenCode, and ChatGPT private tunnels. Any capable agent can follow the [repository onboarding skill](.agents/skills/iracing-data-mcp-onboarding/SKILL.md).

## First Data API call

With an existing bearer token, follow the [Fetch-first quickstart](examples/data-api-first-call/README.md): install `@iracing-data/api-client-fetch`, set `IRACING_ACCESS_TOKEN`, call `DocApi.getDocs()`. The runnable example prints the whole Data API documentation JSON and reports HTTP failures. [Token acquisition and refresh](packages/oauth/client/README.md) are a separate step.

## OpenAPI contracts

| Contract | JSON                                 | YAML                                 | Package/runtime surface                                                                                                                                |
| -------- | ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data API | [iracing.json](openapi/iracing.json) | [iracing.yaml](openapi/iracing.yaml) | iRacing `/data` endpoints; input to the generated Fetch, Axios, and Rust clients.                                                                      |
| OAuth    | [oauth.json](openapi/oauth.json)     | [oauth.yaml](openapi/oauth.yaml)     | iRacing Auth Service requests/responses shared with the OAuth schemas and authored OAuth client. The OAuth client is not generated from this contract. |

Use these contracts to inspect operations and authentication, import into API tooling, or generate an external client. For tools requiring a URL, use the raw [Data API JSON](https://raw.githubusercontent.com/racedirector/iracing-data-api/main/openapi/iracing.json) or [OAuth JSON](https://raw.githubusercontent.com/racedirector/iracing-data-api/main/openapi/oauth.json). Main tracks the current repository contract; pin a commit when reproducible external generation matters, rather than assuming independently versioned packages share a release.

The JSON/YAML files are generated artifacts. Maintained inputs are the [Data API Zod schemas](packages/api/schema/src) and [endpoint mappings](packages/helpers/api-schema-to-openapi/src), and the [OAuth Zod schemas](packages/oauth/schema/src) and [endpoint mappings](packages/helpers/oauth-schema-to-openapi/src). Change those inputs rather than editing OpenAPI output. [Deterministic verification](docs/VERIFICATION.md) checks both formats and downstream Data API clients for freshness. These repository contracts describe maintained coverage; generation alone does not verify live upstream behavior.

## Examples

See [examples/README.md](./examples/README.md).

## Development

Use the Node version in [.nvmrc](.nvmrc) and pnpm pinned in [package.json](package.json):

```bash
pnpm install --frozen-lockfile
pnpm verify
```

Read [repository guidance](AGENTS.md) and the nearest scoped guide before editing.
Discover workspace scripts from their manifests; use `pnpm --filter <package>` for scoped work.

- [Verification and prerequisites](docs/VERIFICATION.md)
- [Workspace maintenance](docs/WORKSPACE-POLICY.md) and [change/release impact planning](docs/CHANGE-IMPACT.md)
- [Issue triage](docs/ISSUE-TRIAGE.md), [release procedure](docs/RELEASING.md), and [repository protection/recovery](docs/REPOSITORY-PROTECTION.md)
- [OpenAPI generation commands](openapi/AGENTS.md), [TypeScript client commands](packages/api/client/AGENTS.md), and [Rust client commands](crates/iracing-data-api-client/AGENTS.md)
- [Contributing workflow](CONTRIBUTING.md) and [security policy](SECURITY.md)

For implementation details, go directly to the [Data API document builder](packages/helpers/api-schema-to-openapi/src/index.ts),
[OAuth client](packages/oauth/client/src/index.ts), [MCP composition](apps/iracing-data-mcp/src/services.ts),
[CLI authentication command](apps/iracing-data-cli/src/authenticate.ts),
[generation/freshness orchestrator](scripts/check-generated.mjs), or
[client presentation normalizer](scripts/normalize-client-presentation.js).

## License

[MIT](LICENSE).
