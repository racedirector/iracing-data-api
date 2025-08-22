import { StateStore } from "@iracing-data/oauth-client/dist/schema/state-store";

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
