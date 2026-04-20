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
  IRacingOAuthJWTAccessTokenHeader,
  IRacingOAuthJWTAccessTokenHeaderSchema,
  IRacingOAuthJWTAccessTokenPayload,
  IRacingOAuthJWTAccessTokenPayloadSchema,
  IRacingOAuthJWTAccessTokenSchema,
} from "@iracing-data/oauth-schema";

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
 */
export async function validateAccessToken(
  accessToken: string,
  options: AccessTokenValidationOptions = {},
): Promise<IRacingOAuthJWTAccessToken> {
  const token = await verifyAccessToken(accessToken);
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockSkewSeconds ?? 5;

  if (token.payload.exp <= now - tolerance) {
    throw new Error("Access token has expired.");
  }

  if (token.payload.iat > now + tolerance) {
    throw new Error("Access token was issued in the future.");
  }

  if (token.payload.auth_time > now + tolerance) {
    throw new Error("Access token authentication time is in the future.");
  }

  if (token.payload.iat < token.payload.auth_time) {
    throw new Error(
      "Access token issue time is earlier than authentication time.",
    );
  }

  if (options.issuer && token.payload.iss !== options.issuer) {
    throw new Error(
      `Access token issuer mismatch. Expected "${options.issuer}" but received "${token.payload.iss}".`,
    );
  }

  if (options.clientId) {
    if (token.payload.client_id !== options.clientId) {
      throw new Error(
        `Access token client_id mismatch. Expected "${options.clientId}" but received "${token.payload.client_id}".`,
      );
    }

    if (!token.payload.aud.includes(options.clientId)) {
      throw new Error(
        `Access token audience does not include the expected client id "${options.clientId}".`,
      );
    }
  }

  if (!token.payload.aud.includes("oauth-api")) {
    throw new Error('Access token audience does not include "oauth-api".');
  }

  if (
    options.expectedEnvironment !== undefined &&
    token.payload.iracing_env !== options.expectedEnvironment
  ) {
    throw new Error(
      `Access token environment mismatch. Expected "${options.expectedEnvironment}" but received "${token.payload.iracing_env}".`,
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
        throw new Error(`Access token is missing required scope "${scope}".`);
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

export function isAccessTokenExpired(accessToken: string) {
  return isJWTExpired(accessToken);
}

export function isAccessTokenValid(accessToken: string) {
  return !isAccessTokenExpired(accessToken);
}

export function isRefreshTokenExpired(refreshToken: string) {
  return isJWTExpired(refreshToken);
}

export function isRefreshTokenValid(refreshToken: string) {
  return !isRefreshTokenExpired(refreshToken);
}
