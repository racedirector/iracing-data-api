import {
  InternalState,
  OAuthClient,
  StateStore,
} from "@iracing-data/oauth-client";
import * as dotenv from "dotenv";

dotenv.config();

class InMemoryStore implements StateStore {
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

export const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_AUTH_CLIENT!,
    clientSecret: process.env.IRACING_AUTH_SECRET,
    username: process.env.IRACING_AUTH_USERNAME,
    password: process.env.IRACING_AUTH_PASSWORD,
    scopes: ["iracing.auth", "iracing.profile"],
  },
  stateStore: new InMemoryStore(),
});
