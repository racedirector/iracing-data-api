import { OAuthClient } from "@iracing-data/oauth-client";
import { InMemoryStore } from "./storage/memory";
import { IRACING_CLIENT_ID, IRACING_AUTH_SECRET, PORT } from "./config";

export const client = new OAuthClient({
  clientMetadata: {
    clientId: IRACING_CLIENT_ID,
    clientSecret: IRACING_AUTH_SECRET,
    redirectUri: `http://127.0.0.1:${PORT}/oauth/iracing/callback`,
    scopes: ["iracing.profile", "iracing.auth"],
  },
  stateStore: new InMemoryStore(),
});

export default client;
