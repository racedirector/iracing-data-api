import {
  bearerAuthChallengeResponse,
  getOAuthProtectedResourceMetadataUrl,
  verifyBearerToken,
  type AuthInfo,
  type OAuthTokenVerifier,
} from "@modelcontextprotocol/server";

/** Verifier-neutral, process-scoped configuration for MCP ingress. */
export interface McpAuthorizationOptions {
  readonly resourceUrl: string;
  readonly verifier: OAuthTokenVerifier;
  readonly requiredScopes?: readonly string[];
}

/** Request-local authorization; MCP session identifiers never grant access. */
export interface McpAuthorizationBoundary {
  readonly metadataUrl: string;
  authorize(
    authorizationHeader: string | undefined,
  ): Promise<AuthInfo | Response>;
}

/** Uses SDK-owned bearer validation and challenge semantics at the Node boundary. */
export function createMcpAuthorizationBoundary(
  options: McpAuthorizationOptions,
): McpAuthorizationBoundary {
  const metadataUrl = getOAuthProtectedResourceMetadataUrl(
    new URL(options.resourceUrl),
  );

  const gate = {
    verifier: options.verifier,
    requiredScopes: options.requiredScopes
      ? [...options.requiredScopes]
      : undefined,
    expectedResource: new URL(options.resourceUrl),
    resourceMetadataUrl: metadataUrl,
  };

  return Object.freeze({
    metadataUrl,
    async authorize(authorizationHeader: string | undefined) {
      try {
        return await verifyBearerToken(authorizationHeader, gate);
      } catch (error) {
        return bearerAuthChallengeResponse(error, gate);
      }
    },
  });
}
