import { OAuthClient } from "@iracing-data/oauth-client";
import { IRACING_AUTH_CLIENT, IRACING_AUTH_SECRET, PORT } from "./config";
import { InMemoryStore } from "./storage/memory";

export const oauthClient = new OAuthClient({
  clientMetadata: {
    clientId: IRACING_AUTH_CLIENT,
    clientSecret: IRACING_AUTH_SECRET,
    redirectUri: `http://127.0.0.1:${PORT}/oauth/iracing/callback`,
    scopes: ["iracing.profile", "iracing.auth"],
  },
  stateStore: new InMemoryStore(),
});

export default oauthClient;
