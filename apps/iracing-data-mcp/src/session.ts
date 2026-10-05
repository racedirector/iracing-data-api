import { Configuration } from "@iracing-data/api-client-fetch";
import {
  OAuthClient,
  OAuthRefreshError,
  OAuthTokenDocumentSessionStore,
  type OAuthClientOptions,
  type OAuthTokenResponse,
  type OAuthTokenDocumentFileSystem,
} from "@iracing-data/oauth-client";
import {
  ApplicationFailure,
  createRequestContext,
} from "./diagnostics/errors.js";
import { createDiagnosticLogger } from "./diagnostics/logging.js";
import type { McpServices } from "./services.js";

export const MCP_LOCAL_SESSION_KEY = "iracing-data-mcp-local";
export const MCP_CREDENTIAL_FILE = "/var/lib/iracing-data-mcp/credentials.json";
export type AuthorizationState =
  "ready" | "authorization_required" | "configuration_error";

export interface SessionCompositionOptions {
  readonly clientMetadata: OAuthClientOptions["clientMetadata"];
  readonly credentialFile?: string;
  readonly fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
  readonly logger?: ReturnType<typeof createDiagnosticLogger>;
}

function authorization(reason: string) {
  return new ApplicationFailure("AUTHORIZATION_REQUIRED", { reason });
}

function validateSession(token: OAuthTokenResponse | undefined) {
  if (!token) {
    throw authorization("missing_session");
  }

  if (!token.refresh_token) {
    throw authorization("invalid_session");
  }

  if (!token.scope?.split(/\s+/).includes("iracing.auth")) {
    throw authorization("insufficient_scope");
  }

  // Expiry is deliberately left to restoreSessionForId; no profile/JWKS request.
  return token;
}

/** One process owns one file until stopped. Loading and health never refresh. */
export async function createMcpServices(
  options: SessionCompositionOptions,
): Promise<McpServices> {
  const logger = options.logger ?? createDiagnosticLogger();

  const context = createRequestContext();

  let state: AuthorizationState = "authorization_required";

  let terminal: ApplicationFailure | undefined;

  const store = new OAuthTokenDocumentSessionStore({
    filePath: options.credentialFile ?? MCP_CREDENTIAL_FILE,
    sessionKey: MCP_LOCAL_SESSION_KEY,
    durability: "required",
    fileSystem: options.fileSystem,
  });

  function transition(next: AuthorizationState) {
    const previous = state;

    state = next;
    if (previous !== next) {
      logger.log("info", context, {
        operation: "session_restore",
        previous_auth_state: previous,
        auth_state: next,
      });
    }
  }

  function quarantine(failure: ApplicationFailure) {
    terminal ??= failure;
    transition("authorization_required");
    logger.failure(context, terminal, { operation: "session_restore" });

    return terminal;
  }

  async function discardCredential() {
    // A fresh store can delete after the original store quarantines a failed write.
    // It performs no grant and uses only the existing secure persistence API.
    await new OAuthTokenDocumentSessionStore({
      filePath: options.credentialFile ?? MCP_CREDENTIAL_FILE,
      sessionKey: MCP_LOCAL_SESSION_KEY,
      durability: "required",
      fileSystem: options.fileSystem,
    })
      .del(MCP_LOCAL_SESSION_KEY)
      .catch(() => undefined);
  }

  // App policy wraps the shared store; all filesystem persistence stays in OAuth.
  const sessionStore: OAuthClientOptions["sessionStore"] = {
    get: (key) => {
      if (terminal) {
        throw terminal;
      }

      return store.get(key);
    },
    del: (key) => store.del(key),
    async set(key, token) {
      if (terminal) {
        throw terminal;
      }

      try {
        validateSession(token);
      } catch (error) {
        const failure = quarantine(
          error instanceof ApplicationFailure
            ? error
            : authorization("invalid_session"),
        );

        await discardCredential();
        throw failure;
      }

      try {
        await store.set(key, token);
      } catch {
        const failure = quarantine(authorization("persistence_failed"));

        await discardCredential();
        throw failure;
      }
    },
  };

  class OwnedOAuthClient extends OAuthClient {
    override async refresh(token: string) {
      if (terminal) {
        throw terminal;
      }

      try {
        return await super.refresh(token);
      } catch (error) {
        // Only structured OAuth rejection is evidence of nonconsumption.
        const cause =
          error instanceof OAuthRefreshError
            ? Object.getOwnPropertyDescriptor(error, "cause")?.value
            : undefined;

        const code =
          error instanceof OAuthRefreshError &&
          error.code === "OAUTH_RESPONSE_BODY_ERROR" &&
          cause !== null &&
          typeof cause === "object"
            ? Object.getOwnPropertyDescriptor(cause, "error")?.value
            : undefined;

        if (code === "temporarily_unavailable" || code === "server_error") {
          const failure = new ApplicationFailure("TOKEN_REFRESH_FAILED", {
            reason: "transient_refresh",
          });

          logger.failure(context, failure, { operation: "refresh" });
          throw failure;
        }

        const failure =
          code === "invalid_grant"
            ? authorization("revoked_authorization")
            : new ApplicationFailure("TOKEN_REFRESH_FAILED", {
                reason: "rotation_uncertain",
              });

        // Remove a possibly consumed credential so a normal restart cannot reuse it.
        // Deletion failure remains terminal; recovery must replace it with stopped login.
        quarantine(failure);
        await discardCredential();
        throw terminal;
      }
    }
    override async restoreSessionForId(key: string) {
      if (key !== MCP_LOCAL_SESSION_KEY) {
        throw authorization("invalid_session");
      }

      if (terminal) {
        throw terminal;
      }

      try {
        const token = validateSession(await super.restoreSessionForId(key));

        transition("ready");

        return token;
      } catch (error) {
        if (error instanceof ApplicationFailure) {
          throw error;
        }

        throw quarantine(authorization("invalid_session"));
      }
    }
  }
  let oauthClient: OAuthClient;

  try {
    oauthClient = new OwnedOAuthClient({
      clientMetadata: { ...options.clientMetadata, scopes: ["iracing.auth"] },

      // No browser authorization is composed into the server.
      stateStore: {
        get: () => undefined,
        set: () => {
          throw new ApplicationFailure("CONFIGURATION_ERROR");
        },
        del: () => undefined,
      },
      sessionStore,
    });
  } catch {
    throw new ApplicationFailure("CONFIGURATION_ERROR");
  }

  try {
    validateSession(await store.get(MCP_LOCAL_SESSION_KEY));
    transition("ready");
  } catch (error) {
    quarantine(
      error instanceof ApplicationFailure
        ? error
        : authorization("invalid_session"),
    );
  }

  return Object.freeze({
    oauthClient,
    authorizationState: () => state,
    dataApiConfiguration: new Configuration({
      accessToken: async () =>
        (await oauthClient.restoreSessionForId(MCP_LOCAL_SESSION_KEY))!
          .access_token,
    }),
  });
}
