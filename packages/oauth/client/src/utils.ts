import crypto from "node:crypto";
import {
  createRemoteJWKSet,
  decodeJwt,
  decodeProtectedHeader,
  jwtVerify,
} from "jose";
import {
  IRacingOAuthJWTAccessToken,
  IRacingOAuthJWTAccessTokenAlgorithmValues,
  IRacingOAuthJWTAccessTokenHeaderSchema,
  IRacingOAuthJWTAccessTokenPayloadSchema,
  IRacingOAuthJWTAccessTokenSchema,
} from "@iracing-data/oauth-schema";
import { OAuthClaimsError } from "./errors";

/**
 * Mask a secret (client_secret or password) using iRacing's masking algorithm.
 *
 * @param secret - The secret to mask
 * @param identifier - client_id for client_secret, username for password
 * @returns Base64 encoded SHA-256 hash of secret + normalized_identifier
 */
export function maskSecret(secret: string, identifier: string): string {
  // Normalize the identifier (trim and lowercase)
  const normalizedId = identifier.trim().toLowerCase();

  // Concatenate secret with normalized identifier
  const combined = `${secret}${normalizedId}`;

  // Create SHA-256 hash and return base64 encoded result
  return crypto.createHash("sha256").update(combined, "utf8").digest("base64");
}

export type AccessTokenValidationOptions = {
  clientId?: string;
  issuer?: string;
  requiredScopes?: readonly string[];
  expectedEnvironment?: string | null;
  clockSkewSeconds?: number;
};

type RemoteJWKSet = ReturnType<typeof createRemoteJWKSet>;

const jwksCache = new Map<string, RemoteJWKSet>();

function getRemoteJWKSet(jku: string): RemoteJWKSet {
  const cached = jwksCache.get(jku);
  if (cached) {
    return cached;
  }

  const jwks = createRemoteJWKSet(new URL(jku));
  jwksCache.set(jku, jwks);
  return jwks;
}

/**
 * Decodes an access token to it's parts.
 * @param accessToken The access token to decode
 * @returns A parsed access token.
 *
 * @throws {Error} If the token is not a valid JWT or does not match the expected access-token schema.
 */
export function decodeAccessToken(
  accessToken: string,
): IRacingOAuthJWTAccessToken {
  const header = IRacingOAuthJWTAccessTokenHeaderSchema.parse(
    decodeProtectedHeader(accessToken),
  );
  const payload = IRacingOAuthJWTAccessTokenPayloadSchema.parse(
    decodeJwt(accessToken),
  );

  return IRacingOAuthJWTAccessTokenSchema.parse({ header, payload });
}

/**
 * Verifies an access token with the iRacing JWKS endpoint and validates its shape.
 *
 * This performs signature verification before any claims are trusted.
 *
 * @throws {Error} If the token cannot be decoded, verified, or parsed into the expected shape.
 */
export async function verifyAccessToken(
  accessToken: string,
): Promise<IRacingOAuthJWTAccessToken> {
  const decoded = decodeAccessToken(accessToken);
  const jwks = getRemoteJWKSet(decoded.header.jku);
  const { protectedHeader, payload } = await jwtVerify(accessToken, jwks, {
    algorithms: [...IRacingOAuthJWTAccessTokenAlgorithmValues],
  });

  const header = IRacingOAuthJWTAccessTokenHeaderSchema.parse(protectedHeader);
  const parsedPayload = IRacingOAuthJWTAccessTokenPayloadSchema.parse(payload);

  return IRacingOAuthJWTAccessTokenSchema.parse({
    header,
    payload: parsedPayload,
  });
}

/**
 * Validates the access token according to https://oauth.iracing.com/oauth2/book/access_token.html#claims-validation
 * @param accessToken The acces token to validate.
 * @param options The options to apply to validation.
 * @returns a parsed and validated access token.
 *
 * @throws {Error} If the token cannot be verified before validation.
 * @throws {Error} If the token is expired or its time-based claims are inconsistent.
 * @throws {Error} If the issuer, client id, audience, environment, or required scopes do not match.
 */
export async function validateAccessToken(
  accessToken: string,
  options: AccessTokenValidationOptions = {},
): Promise<IRacingOAuthJWTAccessToken> {
  const token = await verifyAccessToken(accessToken);
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockSkewSeconds ?? 5;

  if (token.payload.exp <= now - tolerance) {
    throw OAuthClaimsError.tokenExpired();
  }

  if (token.payload.iat > now + tolerance) {
    throw OAuthClaimsError.tokenIssuedInFuture();
  }

  if (token.payload.auth_time > now + tolerance) {
    throw OAuthClaimsError.tokenAuthenticationInFuture();
  }

  if (token.payload.iat < token.payload.auth_time) {
    throw OAuthClaimsError.issueTimeBeforeAuthenticationTime();
  }

  if (options.issuer && token.payload.iss !== options.issuer) {
    throw OAuthClaimsError.issuerMismatch(token.payload.iss, options.issuer);
  }

  if (options.clientId) {
    if (token.payload.client_id !== options.clientId) {
      throw OAuthClaimsError.clientIdMismatch(
        token.payload.client_id,
        options.clientId,
      );
    }

    if (!token.payload.aud.includes(options.clientId)) {
      throw OAuthClaimsError.audienceClientIdMissing(options.clientId);
    }
  }

  if (!token.payload.aud.includes("oauth-api")) {
    throw OAuthClaimsError.oauthApiMissing();
  }

  if (
    options.expectedEnvironment !== undefined &&
    token.payload.iracing_env !== options.expectedEnvironment
  ) {
    throw OAuthClaimsError.environmentMismatch(
      token.payload.iracing_env,
      options.expectedEnvironment,
    );
  }

  if (options.requiredScopes?.length) {
    const grantedScopes = new Set(
      (token.payload.scope ?? "")
        .split(/\s+/)
        .map((scope) => scope.trim())
        .filter(Boolean),
    );

    for (const scope of options.requiredScopes) {
      if (!grantedScopes.has(scope)) {
        throw OAuthClaimsError.scopeMissing(scope);
      }
    }
  }

  return token;
}

function isJWTExpired(token: string) {
  const { exp } = decodeJwt<{ exp?: number }>(token);
  const expiry = new Date((exp ?? 0) * 1000);
  return Date.now() > expiry.getTime();
}

/**
 * Returns whether an access token is expired.
 *
 * @throws {Error} If the token is not a valid JWT.
 */
export function isAccessTokenExpired(accessToken: string) {
  return isJWTExpired(accessToken);
}

/**
 * Returns whether an access token is still valid.
 *
 * @throws {Error} If the token is not a valid JWT.
 */
export function isAccessTokenValid(accessToken: string) {
  return !isAccessTokenExpired(accessToken);
}

/**
 * Returns whether a refresh token is expired.
 *
 * @throws {Error} If the token is not a valid JWT.
 */
export function isRefreshTokenExpired(refreshToken: string) {
  return isJWTExpired(refreshToken);
}

/**
 * Returns whether a refresh token is still valid.
 *
 * @throws {Error} If the token is not a valid JWT.
 */
export function isRefreshTokenValid(refreshToken: string) {
  return !isRefreshTokenExpired(refreshToken);
}
