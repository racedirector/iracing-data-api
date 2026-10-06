# @iracing-data/oauth-client-fetch

Typed Fetch client for the iRacing OAuth API, generated directly from the repository-maintained OAuth OpenAPI contract.

This package owns low-level OAuth endpoint request and response mechanics. Most applications should consume the higher-level [`@iracing-data/oauth-client`](https://www.npmjs.com/package/@iracing-data/oauth-client), which composes this generated client with PKCE, state, session storage, refresh rotation, and other OAuth lifecycle behavior.

## Installation

```bash
pnpm add @iracing-data/oauth-client-fetch
```

## Related @iracing-data packages

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): higher-level authorization and session lifecycle.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): runtime validation and TypeScript contract types.
- [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generates the specification consumed by this package.
- [Data API Fetch client](https://www.npmjs.com/package/@iracing-data/api-client-fetch): typed access to the iRacing Data API after authentication.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.
