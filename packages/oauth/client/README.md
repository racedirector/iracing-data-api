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

`authorize()` generates fresh state by default. A callback listener that generates
its own unpredictable state can pass it to `authorize(state)` so the authorization
URL and retained PKCE context use the listener's state.

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

Set `earlyRefreshWindowMs` on `OAuthClient` to opt into refreshing stored access
tokens before expiry, for example `earlyRefreshWindowMs: 30_000`. The value must
be a finite, nonnegative number of milliseconds; invalid values throw during
construction. A positive window refreshes at or inside the window boundary.
`OAuthClientOptionsSchema` validates the complete options object (including
metadata, store methods, and an optional API factory) before constructor fields
are assigned. Invalid options throw a Zod validation error with field paths;
injected stores and factories retain their identity and are not invoked by parsing.
Omitting the option (or setting it to zero) preserves the existing behavior:
refresh only when the current clock is strictly past expiry.
This policy applies to `restoreSessionForId()` and therefore
`makeProtectedRequest()`, not direct `refresh()` calls or JWT validation.
Early refresh uses the same opaque refresh credential, rotation, persistence,
and same-instance single-flight behavior as expired-token refresh. It requires
a stored refresh token even if the access token is still valid; it does not
add cross-instance coordination or safe automatic retry after uncertain grants.

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

## Protected requests

`makeProtectedRequest(sessionId, method, path, request?)` restores the stored
session, refreshes it when necessary, and sends the protected request. Optional
headers, body, and OAuth request controls belong in the fourth argument:

```ts
await client.makeProtectedRequest("session-id", "POST", "/data/example", {
  headers: new Headers({ "content-type": "application/json" }),
  body: JSON.stringify({ example: true }),
  options: { signal: AbortSignal.timeout(5_000) },
});
```

Migrate older calls that passed headers, body, and options as separate positional
arguments to this options object. Three-argument calls are unchanged.

## Low-level OAuth API

`OAuthApiClient` adapts the generated `@iracing-data/oauth-client-fetch` wire client.
It validates profile, session, and token JSON against the maintained schemas
and rejects successful responses with a non-JSON content type.
`OAuthApiContractError.kind` distinguishes `transport`, `not_json`,
`invalid_json`, and `contract` failures without exposing response bodies or
untrusted transport messages. HTTP failures use `OAuthApiHttpError`, which
preserves the response and request ID.

`OAuthClient` retains full configured `tokenUrl` and `userInfoUrl` overrides,
including custom paths and query parameters, while delegating request
serialization to the generated operations. Authorization-code and refresh
requests continue to use `oauth4webapi` for protocol processing.

## Implementation navigation

[Lifecycle](src/client.ts), [scope representation](../schema/src/scopes.ts),
[wire schemas](../schema/src/schema.ts), [error interpretation](src/errors/oauth.ts),
and [JWT/protocol utilities](src/utils.ts) own the detailed contracts.
The [OAuth document mapping](../../helpers/oauth-schema-to-openapi/src/index.ts)
explains current authored/generated ownership.

# Pre-masked credentials

Client metadata accepts `maskedPassword` instead of `password` and
`maskedClientSecret` instead of `clientSecret`. Pre-masked values are sent
unchanged, bypassing built-in masking. Each pair is mutually exclusive.
The password-limited flow requires `username`, one password form, and one
client-secret form. Public authorization-code clients may omit both secret forms.
