import { OAuthClient, InMemoryStore } from "@iracing-data/oauth-client";
import { IRACING_CLIENT_ID, IRACING_AUTH_SECRET, PORT } from "./config";

export const client = new OAuthClient({
  clientMetadata: {
    clientId: IRACING_CLIENT_ID,
    clientSecret: IRACING_AUTH_SECRET,
    redirectUri: `http://127.0.0.1:${PORT}/oauth/iracing/callback`,
    scopes: ["iracing.profile", "iracing.auth"],
  },
  stateStore: new InMemoryStore(),
  sessionStore: new InMemoryStore(),
});

export default client;
