# @iracing-data/oauth-client

OAuth 2.0 client for iRacing based on the official specification at <https://oauth.iracing.com/oauth2/book/introduction.html>.

## Installation

```bash
pnpm add @iracing-data/oauth-client
```

## Usage

```typescript
import {
  InMemoryStore,
  InternalState,
  IRacingOAuthTokenResponse,
  OAuthClient,
} from "@iracing-data/oauth-client";

const stateStore = new InMemoryStore<string, InternalState>();
const sessionStore = new InMemoryStore<string, IRacingOAuthTokenResponse>();

const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_AUTH_CLIENT_ID!,
    redirectUri: "http://localhost:3000/oauth/callback/iracing",
    scopes: ["iracing.profile", "iracing.auth"],
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
that key. If you omit it, the client falls back to the iRacing customer ID. If
you already have a refresh token and want to force a refresh manually, call
`client.refresh(refreshToken)`.

Pass any {@link SimpleStore} implementation as the state and session store to
control how the client tracks authorization state and OAuth tokens. See
`packages/oauth/client/src/storage/memory-store.ts` for a default in-memory
implementation.

See [`examples/oauth-example`](../../../examples/oauth-example) for a more complete walkthrough.
