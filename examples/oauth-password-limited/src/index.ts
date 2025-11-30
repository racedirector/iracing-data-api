import {
  InMemoryStore,
  InternalState,
  IRacingOAuthTokenResponse,
  OAuthClient,
  StateStore,
} from "@iracing-data/oauth-client";
import { Configuration, MemberApi } from "@iracing-data/api-client-fetch";

async function main() {
  const sessionId = "example-session";

  const stateStore = new InMemoryStore<string, InternalState>();
  const sessionStore = new InMemoryStore<string, IRacingOAuthTokenResponse>();

  const client = new OAuthClient({
    clientMetadata: {
      clientId: process.env.IRACING_AUTH_CLIENT!,
      clientSecret: process.env.IRACING_AUTH_SECRET,
      username: process.env.IRACING_AUTH_USERNAME,
      password: process.env.IRACING_AUTH_PASSWORD,
      scopes: ["iracing.auth", "iracing.profile"],
    },
    stateStore,
    sessionStore,
  });

  const token = await client.passwordLimitedAuthorization(sessionId);

  console.info("Successfully authenticated!");
  console.info("Token expires in", token.expires_in, "seconds");

  const savedToken = await client.getSession(sessionId);
  console.info("Stored session", savedToken);

  const configuration = new Configuration({
    accessToken: token.access_token,
  });

  const api = new MemberApi(configuration);
  const response = await api.getMemberProfile();
  console.info("Fetched authenticated member:", response);
}

main();
