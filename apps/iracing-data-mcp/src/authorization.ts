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

  /** External authorization-server issuer used only for resource metadata. */
  readonly issuer?: string;
  readonly requiredScopes?: readonly string[];
}

/** Request-local authorization; MCP session identifiers never grant access. */
export interface McpAuthorizationBoundary {
  readonly metadataUrl: string;
  metadataResponse(method: string, path: string): Response | undefined;
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
    metadataResponse(method: string, path: string) {
      if (
        !options.issuer ||
        path.split("?")[0] !== new URL(metadataUrl).pathname
      ) {
        return undefined;
      }

      // Narrow issuer-only PRM workaround until the SDK supports this shape:
      // https://github.com/modelcontextprotocol/typescript-sdk/issues/2623
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version",
      };

      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      if (method !== "GET" && method !== "HEAD") {
        return new Response("Method not allowed.", {
          status: 405,
          headers: { ...headers, Allow: "GET, HEAD, OPTIONS" },
        });
      }

      const metadata = {
        resource: options.resourceUrl,
        authorization_servers: [options.issuer],
        ...(options.requiredScopes?.length
          ? { scopes_supported: [...options.requiredScopes] }
          : {}),
      };

      const response = Response.json(metadata, { headers });

      return method === "HEAD"
        ? new Response(null, { headers: response.headers })
        : response;
    },
    async authorize(authorizationHeader: string | undefined) {
      try {
        return await verifyBearerToken(authorizationHeader, gate);
      } catch (error) {
        return bearerAuthChallengeResponse(error, gate);
      }
    },
  });
}
