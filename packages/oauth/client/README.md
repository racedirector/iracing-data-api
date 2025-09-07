# @iracing-data/oauth-client

An OAuth2.0 client for iRacing, as defined by the spec at https://oauth.iracing.com/oauth2/book/introduction.html

## Installation

```sh
npm install @iracing-data/oauth-client
yarn add @iracing-data/oauth-client
pnpm i @iracing-data/oauth-client
```

## Usage

_See [oauth-example](../../../examples/oauth-example) for usage example._

```typescript
import { OAuthClient } from "@iracing-data/oauth-client"


const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_AUTH_CLIENT_ID!,
    redirectUri: "http://localhost:3000/oauth/callback/iracing",
    scopes: ["iracing.profile", "iracing.auth"]
  },
  stateStore: new InMemoryStore()
});

// Invoke authorize and redirect to the provided URL
const { url } = await client.authorize();

redirect(url)

// Some time passes and the callback is invoked...
const params = new URLSearchParams(req.url.split("?")[1]);
const { access_token } = await client.callback(params);

// Do stuff with the token...
```
