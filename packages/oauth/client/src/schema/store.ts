import { SimpleStore } from "../storage";
import { IRacingOAuthTokenResponse } from "@iracing-data/oauth-schema";

export interface InternalState {
  iss: string;
  verifier?: string;
  appState?: string;
}

export type StateStore = SimpleStore<string, InternalState>;
export type SessionStore = SimpleStore<string, IRacingOAuthTokenResponse>;
