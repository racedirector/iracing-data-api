import {
  OAuthError,
  OAuthErrorCode,
  getOAuthProtectedResourceMetadataUrl,
  requireBearerAuth,
  type AuthInfo,
  type OAuthTokenVerifier,
} from "@modelcontextprotocol/server";
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import { z } from "zod";

const noWildcard = (value: string) => !value.includes("*");

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine(noWildcard)
  .transform((value, context) => {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      context.addIssue({
        code: "custom",
        message: "Expected an HTTPS URL without credentials, query, or fragment.",
      });

      return z.NEVER;
    }

    return url.href;
  });

const scope = z
  .string()
  .trim()
  .min(1)
  .refine(noWildcard)
  .refine((value) => !/\s/.test(value));

/**
 * Explicit remote OAuth resource-server configuration. Absence means the existing
 * trusted-loopback unauthenticated deployment; partial configuration is invalid.
 */
export const McpRemoteAuthorizationConfigSchema = z
  .object({
    resourceUrl: httpsUrl,
    issuer: httpsUrl,
    audience: z.string().trim().min(1).refine(noWildcard),
    jwksUrl: httpsUrl,
    requiredScopes: z.array(scope).min(1),
  })
  .superRefine((value, context) => {
    const resource = new URL(value.resourceUrl);

    if (resource.pathname !== "/mcp") {
      context.addIssue({
        code: "custom",
        path: ["resourceUrl"],
        message: "The advertised MCP resource URL must end at /mcp.",
      });
    }

    if (value.audience !== value.resourceUrl) {
      context.addIssue({
        code: "custom",
        path: ["audience"],
        message: "The MCP token audience must equal the advertised MCP resource URL.",
      });
    }

    if (new Set(value.requiredScopes).size !== value.requiredScopes.length) {
      context.addIssue({
        code: "custom",
        path: ["requiredScopes"],
        message: "Required MCP scopes must be unique.",
      });
    }
  });

export type McpRemoteAuthorizationConfig = Readonly<
  z.infer<typeof McpRemoteAuthorizationConfigSchema>
>;

/** Validates and freezes remote resource-server configuration. */
export function parseMcpRemoteAuthorizationConfig(
  input: unknown,
): McpRemoteAuthorizationConfig {
  return Object.freeze(McpRemoteAuthorizationConfigSchema.parse(input));
}

function claimString(payload: Record<string, unknown>, name: string) {
  const value = payload[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Creates a provider-neutral JWT verifier backed by a remote JWKS. Tests may inject
 * a local deterministic JWK resolver; production defaults to HTTPS JWKS discovery.
 */
export function createMcpJwtVerifier(
  config: McpRemoteAuthorizationConfig,
  keySet: JWTVerifyGetKey = createRemoteJWKSet(new URL(config.jwksUrl)),
): OAuthTokenVerifier {
  return {
    async verifyAccessToken(token): Promise<AuthInfo> {
      try {
        const { payload } = await jwtVerify(token, keySet, {
          issuer: config.issuer,
          audience: config.audience,
        });

        if (typeof payload.exp !== "number") {
          throw new Error("Missing exp claim.");
        }

        const scopes =
          typeof payload.scope === "string"
            ? payload.scope.split(" ").filter(Boolean)
            : [];
        const clientId =
          claimString(payload, "client_id") ??
          claimString(payload, "azp") ??
          claimString(payload, "sub");

        if (!clientId) {
          throw new Error("Missing authenticated principal.");
        }

        return {
          token,
          clientId,
          scopes,
          expiresAt: payload.exp,
          resource: new URL(config.resourceUrl),
        };
      } catch {
        throw new OAuthError(OAuthErrorCode.InvalidToken, "Invalid access token");
      }
    },
  };
}

export interface McpAuthorizationBoundary {
  readonly resourceUrl: URL;
  readonly metadataUrl: string;
  readonly metadataPath: string;
  readonly metadata: Readonly<{
    resource: string;
    authorization_servers: readonly string[];
    scopes_supported: readonly string[];
  }>;
  authorize(request: Request): Promise<AuthInfo | Response>;
  metadataResponse(request: Request): Response | undefined;
}

/**
 * Creates the process-scoped OAuth resource-server boundary. It does not provide
 * authorization-server endpoints; clients discover and use the configured issuer.
 */
export function createMcpAuthorizationBoundary(
  config: McpRemoteAuthorizationConfig,
  verifier: OAuthTokenVerifier = createMcpJwtVerifier(config),
): McpAuthorizationBoundary {
  const resourceUrl = new URL(config.resourceUrl);
  const metadataUrl = getOAuthProtectedResourceMetadataUrl(resourceUrl);
  const metadataPath = new URL(metadataUrl).pathname;
  const metadata = Object.freeze({
    resource: config.resourceUrl,
    authorization_servers: Object.freeze([config.issuer]),
    scopes_supported: Object.freeze([...config.requiredScopes]),
  });
  const authorize = requireBearerAuth({
    verifier,
    requiredScopes: [...config.requiredScopes],
    resourceMetadataUrl: metadataUrl,
    expectedResource: resourceUrl,
  });

  return Object.freeze({
    resourceUrl,
    metadataUrl,
    metadataPath,
    metadata,
    authorize,
    metadataResponse(request: Request) {
      if (new URL(request.url).pathname !== metadataPath) {
        return undefined;
      }

      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed.", {
          status: 405,
          headers: { ...headers, Allow: "GET, HEAD, OPTIONS" },
        });
      }

      const response = Response.json(metadata, { headers });
      return request.method === "HEAD"
        ? new Response(null, { status: 200, headers: response.headers })
        : response;
    },
  });
}
