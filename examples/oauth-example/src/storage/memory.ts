import { StateStore } from "@iracing-data/oauth-client/dist/schema/state-store";

export class InMemoryStore implements StateStore {

  get(key, options) {
    return this.state[key];
  set(key, value) {
  private state = new Map<string, any>();

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
