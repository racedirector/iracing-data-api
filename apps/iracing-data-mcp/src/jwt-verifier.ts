import {
  OAuthError,
  OAuthErrorCode,
  type OAuthTokenVerifier,
} from "@modelcontextprotocol/server";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { z } from "zod";

const httpsUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);

    return (
      value === value.trim() &&
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash
    );
  }, "Expected HTTPS without credentials or fragment.");

const issuerUrl = httpsUrl.refine(
  (value) => !new URL(value).search,
  "Issuer must not contain a query.",
);

const scopeToken = z.string().regex(/^[\x21\x23-\x5B\x5D-\x7E]+$/);

/** Production resource identity and default JWT verifier policy. */
export const McpRemoteAuthorizationConfigSchema = z
  .object({
    resourceUrl: httpsUrl,
    issuer: issuerUrl,
    audience: z.string().min(1).optional(),
    jwksUrl: httpsUrl.optional(),
    requiredScopes: z.array(scopeToken).default([]),
  })
  .transform((value) => ({
    ...value,
    audience: value.audience ?? value.resourceUrl,
  }));

/** Exact trusted identifiers; token audience may differ from the MCP resource. */
export type McpRemoteAuthorizationConfig = Readonly<
  Omit<z.infer<typeof McpRemoteAuthorizationConfigSchema>, "requiredScopes"> & {
    readonly requiredScopes: readonly string[];
  }
>;

/** Validates production policy without normalizing OAuth identifiers. */
export function parseMcpRemoteAuthorizationConfig(
  input: unknown,
): McpRemoteAuthorizationConfig {
  const config = McpRemoteAuthorizationConfigSchema.parse(input);

  return Object.freeze({
    ...config,
    requiredScopes: Object.freeze(config.requiredScopes),
  });
}

/** Space-delimited, opaque and case-sensitive OAuth scopes; '*' is a literal token. */
export function parseOAuthScopes(value: string): string[] {
  return value
    .split(" ")
    .filter(Boolean)
    .map((token) => scopeToken.parse(token));
}

/** Absence preserves local mode; any remote setting requires resource and issuer. */
export function remoteAuthorizationFromEnv(
  env: NodeJS.ProcessEnv,
): McpRemoteAuthorizationConfig | undefined {
  const values = [
    env.IRACING_MCP_RESOURCE_URL,
    env.IRACING_MCP_AUTH_ISSUER,
    env.IRACING_MCP_AUTH_AUDIENCE,
    env.IRACING_MCP_AUTH_JWKS_URL,
    env.IRACING_MCP_AUTH_SCOPES,
  ];

  if (values.every((value) => value === undefined)) {
    return undefined;
  }

  return parseMcpRemoteAuthorizationConfig({
    resourceUrl: env.IRACING_MCP_RESOURCE_URL,
    issuer: env.IRACING_MCP_AUTH_ISSUER,
    audience: env.IRACING_MCP_AUTH_AUDIENCE,
    jwksUrl: env.IRACING_MCP_AUTH_JWKS_URL,
    requiredScopes:
      env.IRACING_MCP_AUTH_SCOPES === undefined
        ? []
        : parseOAuthScopes(env.IRACING_MCP_AUTH_SCOPES),
  });
}

/** Resolves JWT keys from explicit configuration, then RFC 8414 / OIDC metadata. */
export async function resolveMcpJwksUrl(
  config: McpRemoteAuthorizationConfig,
  fetchMetadata: typeof fetch = fetch,
): Promise<URL> {
  if (config.jwksUrl) {
    return new URL(config.jwksUrl);
  }

  const issuer = new URL(config.issuer);

  const issuerPath = issuer.pathname.replace(/\/$/, "");

  const urls = [
    new URL(
      `/.well-known/oauth-authorization-server${issuerPath}`,
      issuer.origin,
    ),
    new URL(`${issuerPath}/.well-known/openid-configuration`, issuer.origin),
  ];

  for (const url of urls) {
    const response = await fetchMetadata(url, {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 404) {
      continue;
    }

    if (!response.ok) {
      throw new Error("MCP authorization metadata unavailable.");
    }

    const metadata: unknown = await response.json();

    const parsed = z
      .object({
        issuer: z.literal(config.issuer),
        jwks_uri: httpsUrl.optional(),
      })
      .safeParse(metadata);

    if (!parsed.success) {
      throw new Error("MCP authorization metadata is untrusted.");
    }

    if (parsed.data.jwks_uri) {
      return new URL(parsed.data.jwks_uri);
    }
  }

  throw new Error("MCP authorization metadata has no usable JWKS URI.");
}

/** JOSE owns signature, exact issuer/audience and temporal claim validation. */
export function createMcpJwtVerifier(
  config: McpRemoteAuthorizationConfig,
  keySet: JWTVerifyGetKey,
): OAuthTokenVerifier {
  return {
    async verifyAccessToken(token) {
      try {
        const { payload } = await jwtVerify(token, keySet, {
          issuer: config.issuer,
          audience: config.audience,
        });

        const clientId = [payload.client_id, payload.azp, payload.sub].find(
          (value) => typeof value === "string" && value.length > 0,
        );

        if (typeof payload.exp !== "number" || typeof clientId !== "string") {
          throw new Error("Missing access-token claims.");
        }

        return {
          token,
          clientId,
          scopes:
            typeof payload.scope === "string"
              ? parseOAuthScopes(payload.scope)
              : [],
          expiresAt: payload.exp,
          resource: new URL(config.resourceUrl),
        };
      } catch {
        throw new OAuthError(
          OAuthErrorCode.InvalidToken,
          "Invalid access token",
        );
      }
    },
  };
}

/** Resolves trusted verifier material before production starts accepting requests. */
export async function createDefaultMcpJwtVerifier(
  config: McpRemoteAuthorizationConfig,
): Promise<OAuthTokenVerifier> {
  return createMcpJwtVerifier(
    config,
    createRemoteJWKSet(await resolveMcpJwksUrl(config)),
  );
}
