import { OAuthClient } from "@iracing-data/oauth-client";
import { InMemoryStore } from "./storage/memory";
import {
  IRACING_CLIENT_ID,
  IRACING_AUTH_SECRET,
  IRACING_AUTH_USERNAME,
  IRACING_AUTH_PASSWORD,
  PORT,
  isPasswordLimitedEnabled,
} from "./config";

export const client = new OAuthClient({
  clientMetadata: {
    clientId: IRACING_CLIENT_ID,
    clientSecret: IRACING_AUTH_SECRET,
    username: IRACING_AUTH_USERNAME,
    password: IRACING_AUTH_PASSWORD,
    redirectUri: `http://127.0.0.1:${PORT}/oauth/iracing/callback`,
    scopes: ["iracing.profile", "iracing.auth"],
  },
  stateStore: new InMemoryStore(),
});

if (isPasswordLimitedEnabled) {
  const response = await client.passwordLimitedAuthorization();
  console.log(
    "Successfully authenticated with password limited authentication:",
    response
  );
}

export default client;
