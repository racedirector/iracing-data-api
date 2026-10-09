# @iracing-data/oauth-client

OAuth 2.0 client for iRacing with authorization-code flow, token refresh, and pluggable session storage.

## Installation

```bash
pnpm add @iracing-data/oauth-client
```

## Usage

```typescript
import {
  InMemoryStore,
  InternalState,
  OAuthTokenResponse,
  OAuthClient,
} from "@iracing-data/oauth-client";

const stateStore = new InMemoryStore<string, InternalState>();
const sessionStore = new InMemoryStore<string, OAuthTokenResponse>();

const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_AUTH_CLIENT_ID!,
    redirectUri: "http://localhost:3000/oauth/callback/iracing",
    scopes: ["iracing.auth"],
  },
  stateStore,
  sessionStore,
});

// Begin the authorization code flow
const { url } = await client.authorize();

// After redirect/callback
const params = new URLSearchParams(req.url.split("?")[1]);
const { access_token } = await client.callback(params, "user-session");

// Later, restore the stored session with the same key.
// `restoreSessionForId()` refreshes the access token automatically when needed.
// If the session key is missing, it returns `undefined`.
const storedToken = await client.restoreSessionForId("user-session");

if (storedToken) {
  const decoded = client.parseAccessToken(storedToken.access_token);
  const validated = await client.validateAccessToken(storedToken.access_token);
}
```

When you pass a `sessionId` to `callback()`, the client stores the token under
that key without fetching the iRacing profile. This allows callers that already
own the storage key to use only the scopes required by their protected resources.
If you omit `sessionId`, the client fetches the iRacing profile and stores the
session under the iRacing customer ID, so that flow requires profile access. If
you already have a refresh token and want to force a refresh manually, call
`client.refresh(refreshToken)`.

Use the injected stores to choose persistence. See the [lifecycle owner](src/client.ts)
for opaque refresh, rotation and same-instance concurrency contracts. JWT convenience
helpers are separate from refresh restoration. Direct `refresh()` does not persist
its returned token.

## Durable single-document token storage

`OAuthTokenDocumentSessionStore` is the narrow durable `SessionStore` for a
single configured session key. It persists the existing bare
`OAuthTokenResponse` JSON document instead of a key/value envelope, so the file
is directly compatible with the repository CLI's JSON credential output.

```typescript
import { OAuthTokenDocumentSessionStore } from "@iracing-data/oauth-client";

const sessionStore = new OAuthTokenDocumentSessionStore({
  filePath: "/var/lib/my-app/credentials.json",
  sessionKey: "local-session",
});
```

Use one configured session key and one process per credential directory. Stop before
repair/replacement and never restore a consumed refresh-token backup. POSIX callers
must provide an owned `0700` directory and `0600` document. Windows requires host
ACLs and an explicit portability decision for directory durability.

Read the [token-document owner](src/storage/token-document-store.ts) for validation,
atomic publication, quarantine and durability contracts before selecting a store.
[DiskStore](src/storage/disk-store.ts) is a generic key/value utility with weaker
guarantees; [InMemoryStore](src/storage/memory-store.ts) has no persistence.
Failures can retain sensitive causes: use safe application diagnostics.

See [`examples/oauth-example`](../../../examples/oauth-example) for a more complete walkthrough.

## Related packages

See the [repository package chooser](https://github.com/racedirector/iracing-data-api#which-package-should-i-use) and [runnable examples](https://github.com/racedirector/iracing-data-api/tree/main/examples#readme).

## Schema naming compatibility

Canonical schema exports omit the leading `IRacing` and retain `OAuth` where present. All historical schema names remain as deprecated aliases with identical values and equivalent types, including OAuth-client re-exports. See the [complete migration map and compatibility policy](../../../docs/SCHEMA-MIGRATION.md).

## Implementation navigation

[Lifecycle](src/client.ts), [scope representation](../schema/src/scopes.ts),
[wire schemas](../schema/src/schema.ts), [error interpretation](src/errors/oauth.ts),
and [JWT/protocol utilities](src/utils.ts) own the detailed contracts.
The [OAuth document mapping](../../helpers/oauth-schema-to-openapi/src/index.ts)
explains current authored/generated ownership.
