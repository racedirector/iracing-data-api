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

// Later, grab or refresh the stored session
const storedToken = await client.getSession("user-session");
const { access_token: refreshedAccessToken } = await client.refreshSession(
  "user-session"
);
```

Pass any {@link SimpleStore} implementation as the state and session store to
control how the client tracks authorization state and OAuth tokens. See
`packages/oauth/client/src/storage/memory-store.ts` for a default in-memory
implementation.

See [`examples/oauth-example`](../../../examples/oauth-example) for a more complete walkthrough.
