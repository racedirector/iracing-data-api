export class ClientMetadataError extends Error {
  static missingRedirectUri() {
    return new ClientMetadataError(
      "Client is not configured for the authorization code flow; missing `redirectUri`.",
    );
  }

  static missingCredentials(type: "username" | "password") {
    return new ClientMetadataError(
      `No ${type} provided for password limited authentication flow.`,
    );
  }

  static missingClientSecret() {
    return new ClientMetadataError(
      "Client secret not provided; password limited authorization is not allowed.",
    );
  }
}

export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(
      `Could not find session matching ${sessionId}. Did you forget to authenticate?`,
    );
  }
}
