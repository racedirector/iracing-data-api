import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  InMemoryStore,
  InternalState,
  IRacingOAuthClientMetadata,
  OAuthClient,
  OAuthClientOptions,
} from "@iracing-data/oauth-client";
import { createDefaultFileSessionStore, FileSessionStore } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveCredentialsFile() {
  return path.resolve(__dirname, "../../../../.iracing-data/credentials.json");
}

export interface CreateOAuthClientOptions
  extends
    Pick<
      IRacingOAuthClientMetadata,
      "clientId" | "clientSecret" | "redirectUri" | "scopes"
    >,
    Partial<Pick<OAuthClientOptions, "stateStore" | "sessionStore">> {}

export function createOAuthClient({
  clientId,
  clientSecret,
  redirectUri,
  scopes,
  stateStore = new InMemoryStore<string, InternalState>(),
  sessionStore = new FileSessionStore(resolveCredentialsFile()),
}: CreateOAuthClientOptions) {
  return new OAuthClient({
    clientMetadata: {
      clientId,
      clientSecret,
      redirectUri,
      scopes,
    },
    stateStore,
    sessionStore,
  });
}
