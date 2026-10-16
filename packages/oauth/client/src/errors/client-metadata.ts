/**
 * Configuration failure raised when required OAuth client metadata is absent or invalid before
 * protocol work begins.
 */
export class ClientMetadataError extends Error {
  /**
   * Describes an authorization-code registration missing its callback URL.
   * @returns {ClientMetadataError} Classified OAuth failure retaining the relevant operation context.
   */
  static missingRedirectUri() {
    return new ClientMetadataError(
      "Client is not configured for the authorization code flow; missing `redirectUri`.",
    );
  }

  /**
   * Describes a missing username or password for the password-limited grant.
   * @param {"username" | "password"} type - Missing account credential to identify in the failure.
   * @returns {ClientMetadataError} Classified OAuth failure retaining the relevant operation context.
   */
  static missingCredentials(type: "username" | "password") {
    return new ClientMetadataError(
      `No ${type} provided for password limited authentication flow.`,
    );
  }

  /**
   * Describes a confidential grant attempted without a client secret.
   * @returns {ClientMetadataError} Classified OAuth failure retaining the relevant operation context.
   */
  static missingClientSecret() {
    return new ClientMetadataError(
      "Client secret not provided; password limited authorization is not allowed.",
    );
  }
}

/**
 * Session-store failure indicating that the requested logical session has no persisted token
 * state.
 */
export class SessionNotFoundError extends Error {
  /**
   * Creates the classified OAuth failure with its operation context.
   * @param {string} sessionId - Key identifying the stored OAuth session.
   */
  constructor(sessionId: string) {
    super(
      `Could not find session matching ${sessionId}. Did you forget to authenticate?`,
    );
  }
}
