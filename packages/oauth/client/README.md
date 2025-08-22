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
import { OAuthClient, StateStore } from "@iracing-data/oauth-client"

export class InMemoryStore implements StateStore {
  private state = new Map();

  get(key, options) {
    return this.state[key];
  }
  set(key, value) {
    this.state[key] = value;
  }
  del(key) {
    delete this.state[key];
  }
  clear() {
    this.state.clear();
  }
}


const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_AUTH_CLIENT_ID!
    redirectUri: "http://localhost:3000/oauth/callback/iracing"
    scopes: "iracing.auth iracing.profile"
  },
  stateStore: new InMemoryStore()
});

const { url } = await client.authorize();

redirect(url)

// Some time passes...
const params = new URLSearchParams(req.url.split("?")[1]);
const { access_token } = await client.callback(params);

// Do stuff with the token...
```
