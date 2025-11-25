import {
  InternalState,
  OAuthClient,
  StateStore,
} from "@iracing-data/oauth-client";
import { Configuration, MemberApi } from "@iracing-data/api-client-fetch";

export class InMemoryStore implements StateStore {
  private state = new Map<string, InternalState>();

  get(key, options) {
    return this.state.get(key);
  }
  set(key, value) {
    this.state.set(key, value);
  }
  del(key) {
    this.state.delete(key);
  }
  clear() {
    this.state.clear();
  }
}

async function main() {
  const client = new OAuthClient({
    clientMetadata: {
      clientId: process.env.IRACING_AUTH_CLIENT!,
      clientSecret: process.env.IRACING_AUTH_SECRET,
      username: process.env.IRACING_AUTH_USERNAME,
      password: process.env.IRACING_AUTH_PASSWORD,
      scopes: ["iracing.auth", "iracing.profile"],
    },
    stateStore: new InMemoryStore(),
  });

  const token = await client.passwordLimitedAuthorization();

  console.info("Successfully authenticated!");
  console.info("Token expires in", token.expires_in, "seconds");

  const configuration = new Configuration({
    accessToken: token.access_token,
  });

  const api = new MemberApi(configuration);
  const response = await api.getMemberProfile();
  console.info("Fetched authenticated member:", response);
}

main();
