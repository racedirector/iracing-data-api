import { SimpleStore } from "../storage";

export interface InternalState {
  iss: string;
  verifier?: string;
  appState?: string;
}

export type StateStore = SimpleStore<string, InternalState>;
