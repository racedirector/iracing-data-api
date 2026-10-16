/**
 * Process/account owner for local durable authorization and generated-client composition.
 *
 * This module specializes the reusable OAuthClient and token-document store for
 * one stopped-login credential lifecycle. Shared protocol/PKCE/refresh mechanics
 * live in packages/oauth/client/src/client.ts; secure filesystem mutations live
 * in that package's storage/token-document-store.ts. Loading and health do not
 * refresh. Token acquisition restores one configured session, requiring a refresh
 * credential and iracing.auth, without profile lookup or JWKS requests.
 *
 * The app's rotationPending interval covers grant submission through durable
 * replacement. Only explicit nonconsuming transient rejection is safe to retry;
 * unknown consumption or failed publication quarantines the owner and invalidates
 * account state. Old refresh credentials must never be restored as rollback.
 * Shutdown makes the owner terminal, rejects late publication of ready state and
 * attempts removal of uncertain credentials, including publication already in
 * flight. Failure to confirm removal requires stopped re-login before restart.
 *
 * One process owns the file by operator discipline, not a process lock. There is
 * no hot credential reload. Repair/re-login creates a new owner after stopping.
 * The generated Data API configuration shares this fixed owner.
 */
import { Configuration } from "@iracing-data/api-client-fetch";
import {
  ApplicationFailure,
  createRequestContext,
} from "@iracing-data/mcp-tools";
import {
  OAuthClient,
  OAuthRefreshError,
  OAuthTokenDocumentSessionStore,
  type OAuthClientOptions,
  type OAuthTokenResponse,
  type OAuthTokenDocumentFileSystem,
} from "@iracing-data/oauth-client";
import { createDiagnosticLogger } from "./diagnostics/logging.js";
import type { AuthorizationState, McpServices } from "./services.js";

/** Stable key for the single locally owned MCP OAuth session. */
export const MCP_LOCAL_SESSION_KEY = "iracing-data-mcp-local";

/** Default credential-document path inside the MCP container. */
export const MCP_CREDENTIAL_FILE = "/var/lib/iracing-data-mcp/credentials.json";

export type { AuthorizationState } from "./services.js";

/**
 * Host-provided composition inputs for MCP session services, including credential persistence
 * and diagnostic seams.
 */
export interface SessionCompositionOptions {
  /** Registration and endpoint policy supplied to the OAuth lifecycle. */
  readonly clientMetadata: OAuthClientOptions["clientMetadata"];

  /** Path to the durable OAuth credential document. */
  readonly credentialFile?: string;

  /** Filesystem operations supplied by the host for persistence. */
  readonly fileSystem?: Partial<OAuthTokenDocumentFileSystem>;

  /** Structured diagnostic logger supplied by the host. */
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

/**
 * Compose the OAuth client, Data API configuration around one session file.
 * One process owns one file until stopped. Loading and health never refresh;
 * token requests restore the session and may refresh and persist rotated credentials.
 * Missing or invalid stored credentials leave services in authorization_required
 * and make later token requests fail. OAuth client construction errors instead
 * reject composition with CONFIGURATION_ERROR. Returned tool access shares one opaque
 * continuation scope and throws AUTHORIZATION_REQUIRED after quarantine or shutdown begins.
 * @param {SessionCompositionOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<McpServices>} Composed OAuth and Data API services with their credential owner.
 */
export async function createMcpServices(
  options: SessionCompositionOptions,
): Promise<McpServices> {
  const owner = new SessionOwner(options);

  let oauthClient: OAuthClient;

  try {
    oauthClient = new OwnedOAuthClient(
      {
        clientMetadata: { ...options.clientMetadata, scopes: ["iracing.auth"] },

        // No browser authorization is composed into the server.
        stateStore: {
          get: () => undefined,
          set: () => {
            throw new ApplicationFailure("CONFIGURATION_ERROR");
          },
          del: () => undefined,
        },
        sessionStore: owner.sessionStore,
      },
      owner,
    );
  } catch {
    throw new ApplicationFailure("CONFIGURATION_ERROR");
  }

  try {
    validateSession(await owner.store.get(MCP_LOCAL_SESSION_KEY));
    owner.transition("ready");
  } catch (error) {
    owner.quarantine(
      error instanceof ApplicationFailure
        ? error
        : authorization("invalid_session"),
    );
  }

  const dataApiConfiguration = new Configuration({
    accessToken: async () =>
      validateSession(
        await oauthClient.restoreSessionForId(MCP_LOCAL_SESSION_KEY),
      ).access_token,
  });

  const continuationScope = {};

  return Object.freeze({
    shutdownAuthorizationOwner: () => owner.shutdownAuthorizationOwner(),
    oauthClient,
    authorizationState: () => owner.state,
    dataApiConfiguration,
    getDataApiAccess: () => {
      if (owner.terminal) {
        throw authorization("invalid_session");
      }

      if (owner.ownerClosing) {
        throw authorization("invalid_session");
      }

      return { configuration: dataApiConfiguration, continuationScope };
    },
  });
}

class SessionOwner {
  readonly logger: ReturnType<typeof createDiagnosticLogger>;
  readonly context = createRequestContext();
  state: AuthorizationState = "authorization_required";
  terminal: ApplicationFailure | undefined;

  // Covers grant submission through durable replacement, not just the HTTP response.
  rotationPending = false;
  ownerClosing = false;
  ownerShutdown: Promise<void> | undefined;
  readonly store: OAuthTokenDocumentSessionStore;
  readonly sessionStore: OAuthClientOptions["sessionStore"];

  constructor(readonly options: SessionCompositionOptions) {
    this.logger = options.logger ?? createDiagnosticLogger();
    this.store = new OAuthTokenDocumentSessionStore({
      filePath: options.credentialFile ?? MCP_CREDENTIAL_FILE,
      sessionKey: MCP_LOCAL_SESSION_KEY,
      durability: "required",
      fileSystem: options.fileSystem,
    });
    this.sessionStore = {
      get: (key) => {
        if (this.terminal) {
          throw this.terminal;
        }

        return this.store.get(key);
      },
      del: (key) => this.store.del(key),
      set: (key, token) => this.set(key, token),
    };
  }
  transition(next: AuthorizationState) {
    const previous = this.state;

    this.state = next;
    if (previous !== next) {
      this.logger.log("info", this.context, {
        operation: "session_restore",
        previous_auth_state: previous,
        auth_state: next,
      });
    }
  }

  quarantine(failure: ApplicationFailure) {
    this.terminal ??= failure;
    this.transition("authorization_required");
    this.logger.failure(this.context, this.terminal, {
      operation: "session_restore",
    });

    return this.terminal;
  }

  async discardCredential() {
    // A fresh store can delete after the original store quarantines a failed write.
    // It performs no grant and uses only the existing secure persistence API.
    return await new OAuthTokenDocumentSessionStore({
      filePath: this.options.credentialFile ?? MCP_CREDENTIAL_FILE,
      sessionKey: MCP_LOCAL_SESSION_KEY,
      durability: "required",
      fileSystem: this.options.fileSystem,
    })
      .del(MCP_LOCAL_SESSION_KEY)
      .then(
        () => true,
        () => false,
      );
  }

  currentFailure(): ApplicationFailure | undefined {
    return this.terminal;
  }

  async set(key: string, token: OAuthTokenResponse) {
    if (this.terminal) {
      throw this.terminal;
    }

    try {
      validateSession(token);
    } catch (error) {
      const failure = this.quarantine(
        error instanceof ApplicationFailure
          ? error
          : authorization("invalid_session"),
      );

      await this.discardCredential();
      throw failure;
    }

    try {
      await this.store.set(key, token);

      // A write that was already underway during shutdown can publish after deletion.
      // Never allow that late publication or restoration to revive this owner.
      const terminal = this.currentFailure();

      if (terminal) {
        await this.discardCredential();
        throw terminal;
      }

      this.rotationPending = false;
    } catch {
      const failure = this.quarantine(authorization("persistence_failed"));

      await this.discardCredential();
      throw failure;
    }
  }
  shutdownAuthorizationOwner() {
    this.ownerShutdown ??= (async () => {
      this.ownerClosing = true;
      if (!this.rotationPending) {
        return;
      }

      this.quarantine(
        new ApplicationFailure("TOKEN_REFRESH_FAILED", {
          reason: "rotation_uncertain",
        }),
      );
      this.logger.failure(this.context, this.terminal, {
        operation: "shutdown",
      });
      if (!(await this.discardCredential())) {
        // Do not report a clean stop when secure deletion could not be confirmed.
        throw new ApplicationFailure("CONFIGURATION_ERROR");
      }
    })();

    return this.ownerShutdown;
  }
}
class OwnedOAuthClient extends OAuthClient {
  constructor(
    options: OAuthClientOptions,
    readonly owner: SessionOwner,
  ) {
    super(options);
  }
  override async refresh(token: string) {
    if (this.owner.terminal) {
      throw this.owner.terminal;
    }

    this.owner.rotationPending = true;
    try {
      return await super.refresh(token);
    } catch (error) {
      const code: unknown = refreshRejectionCode(error);

      if (code === "temporarily_unavailable" || code === "server_error") {
        this.owner.rotationPending = false;
        const failure = new ApplicationFailure("TOKEN_REFRESH_FAILED", {
          reason: "transient_refresh",
        });

        this.owner.logger.failure(this.owner.context, failure, {
          operation: "refresh",
        });
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
      const terminal = this.owner.quarantine(failure);

      await this.owner.discardCredential();
      throw terminal;
    }
  }
  override async restoreSessionForId(key: string) {
    if (key !== MCP_LOCAL_SESSION_KEY) {
      throw authorization("invalid_session");
    }

    if (this.owner.terminal) {
      throw this.owner.terminal;
    }

    if (this.owner.ownerClosing) {
      throw authorization("invalid_session");
    }

    try {
      const token = validateSession(await super.restoreSessionForId(key));

      const terminal = this.owner.currentFailure();

      if (terminal) {
        throw terminal;
      }

      this.owner.transition("ready");

      return token;
    } catch (error) {
      if (error instanceof ApplicationFailure) {
        throw error;
      }

      throw this.owner.quarantine(authorization("invalid_session"));
    }
  }
}

function refreshRejectionCode(error: unknown): unknown {
  // Only structured OAuth rejection is evidence of nonconsumption.
  const cause: unknown =
    error instanceof OAuthRefreshError
      ? Object.getOwnPropertyDescriptor(error, "cause")?.value
      : undefined;

  const code: unknown =
    error instanceof OAuthRefreshError &&
    error.code === "OAUTH_RESPONSE_BODY_ERROR" &&
    cause !== null &&
    typeof cause === "object"
      ? Object.getOwnPropertyDescriptor(cause, "error")?.value
      : undefined;

  return code;
}
