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

`restoreSessionForId()` treats the stored `refresh_token` as an opaque OAuth
grant credential. It does not decode the refresh token or require JWT structure;
when an expired access token needs renewal, the authorization server decides
whether the refresh credential is expired, revoked, malformed, or otherwise
invalid. The JWT convenience helpers in `dist/utils.js`, including
`isRefreshTokenExpired()` and `isRefreshTokenValid()`, intentionally retain their
JWT-only behavior and are not used to gate session restoration.

Concurrent `restoreSessionForId()` calls for the same expired session share one
refresh operation within an `OAuthClient` instance. The operation completes only
after the merged session, including the rotated refresh token and retained fields,
has been persisted. Failed operations are cleared so later calls can retry;
different session IDs refresh independently. Coordination does not extend across
client instances or processes. `refresh()` returns the token endpoint response
without storing it or coordinating other calls.

Pass any {@link SimpleStore} implementation as the state and session store to
control how the client tracks authorization state and OAuth tokens. See
`packages/oauth/client/src/storage/memory-store.ts` for a default in-memory
implementation.

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

The store rejects all keys except the configured key, validates the OAuth token
document, serializes mutations within one process, and publishes in-memory state
only after the durable mutation succeeds. A load or persistence failure
quarantines that store instance so it cannot fall back to stale credentials.
Create a new instance only after the underlying credential state has been
repaired or replaced.

`readOAuthTokenDocument()` distinguishes a missing document (`undefined`) from
corrupt, unreadable, unsafe, or oversized state. `writeOAuthTokenDocument()`
uses a same-directory exclusive temporary file, fsyncs it, atomically publishes
it, and fsyncs the parent directory. On POSIX it requires current-user ownership,
mode `0700` for the credential directory, mode `0600` for the document, regular
files only, no symlinks, and a 64 KiB maximum document size.

Directory fsync is required by default. `durability: "best-effort"` is an
explicit portability escape hatch for platforms/filesystems that cannot sync a
directory; callers that require Docker/Linux crash durability should keep the
default. Windows does not provide POSIX ownership/mode guarantees through these
Node APIs, so callers must rely on host/container ACLs and use best-effort
directory durability where required.

This store is intentionally process-local. It does not implement distributed
locking, multiple writers, replicas, file watching, or hot credential
replacement. One process should own one credential directory at a time. Treat
OAuth credential files as secrets rather than backups; a backup containing an
older refresh token is generally unusable after token rotation.

The generic `DiskStore` remains a key/value utility with its historical behavior;
it is not upgraded or implicitly substituted by the token-document store.
Its failure warnings omit file paths, stored values, and raw errors to protect
credentials. A load failure starts with an empty store; check the configured
file's permissions and JSON format. A persistence failure throws the original
error to the caller; check that the directory exists and the file is writable,
and avoid logging the raw error because it can contain sensitive data.

See [`examples/oauth-example`](../../../examples/oauth-example) for a more complete walkthrough.

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.

## Schema naming compatibility

Canonical schema exports omit the leading `IRacing` and retain `OAuth` where present. All historical schema names remain as deprecated aliases with identical values and equivalent types, including OAuth-client re-exports. See the [complete migration map and compatibility policy](../../../docs/SCHEMA-MIGRATION.md).
