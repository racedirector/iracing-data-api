import type { SimpleStore } from "../storage";
import type { OAuthTokenResponse } from "@iracing-data/oauth-schema";

/**
 * Transient authorization state persisted between authorize and callback, including PKCE
 * verifier and caller application state.
 */
export interface InternalState {
  /** Expected authorization-server issuer associated with this state. */
  iss: string;

  /** PKCE code verifier retained until the authorization callback. */
  verifier?: string;

  /** Opaque caller state restored after the authorization callback. */
  appState?: string;
}

/**
 * Store contract for short-lived OAuth authorization state keyed by the generated callback
 * state value.
 */
export type StateStore = SimpleStore<string, InternalState>;

/** Store contract for OAuth token sessions keyed by the application-defined session identifier. */
export type SessionStore = SimpleStore<string, OAuthTokenResponse>;
