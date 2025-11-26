# @iracing-data/oauth-client

OAuth 2.0 client for iRacing based on the official specification at <https://oauth.iracing.com/oauth2/book/introduction.html>.

## Installation

```bash
pnpm add @iracing-data/oauth-client
```

## Usage

```typescript
import { InMemoryStore, OAuthClient } from "@iracing-data/oauth-client";

const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_AUTH_CLIENT_ID!,
    redirectUri: "http://localhost:3000/oauth/callback/iracing",
    scopes: ["iracing.profile", "iracing.auth"],
  },
  stateStore: new InMemoryStore(),
});

// Begin the authorization code flow
const { url } = await client.authorize();

// After redirect/callback
const params = new URLSearchParams(req.url.split("?")[1]);
const { access_token } = await client.callback(params);
```

See [`examples/oauth-example`](../../../examples/oauth-example) for a more complete walkthrough.
