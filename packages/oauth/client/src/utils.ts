/**
 * Protocol masking and JWT convenience validation, separate from session policy.
 *
 * MaskSecret implements the provider-specific secret-plus-normalized-identifier
 * SHA-256/base64 transformation; it is not credential encryption or safe logging.
 * Decode helpers establish structure only. Verification performs jose signature
 * validation with the maintained algorithm/header/JWKS contract before claims checks;
 * required issuer/client/audience/scope/environment policy belongs to the caller.
 *
 * Refresh-token convenience expiry helpers assume JWT structure by design. Session
 * restoration in client.ts does not call them to gate opaque grant credentials;
 * the authorization server decides refresh validity. Synthetic JWT expiry fixtures
 * exercise structure/lifecycle, not signatures or live upstream authentication.
 */
import crypto from "node:crypto";
import {
  OAuthJWTAccessTokenAlgorithmValues,
  OAuthJWTAccessTokenHeaderSchema,
  OAuthJWTAccessTokenPayloadSchema,
  OAuthJWTAccessTokenSchema,
} from "@iracing-data/oauth-schema";
import {
  createRemoteJWKSet,
  decodeJwt,
  decodeProtectedHeader,
  jwtVerify,
} from "jose";
import { OAuthClaimsError } from "./errors";
import type { OAuthJWTAccessToken } from "@iracing-data/oauth-schema";

/**
 * Mask a secret (client_secret or password) using iRacing's masking algorithm.
 * @see {@link https://oauth.iracing.com/oauth2/book/token_endpoint.html|iRacing token endpoint}
 *
 * @param {string} secret - Unmodified password or client secret, retained verbatim before hashing.
 * @param {string} identifier - Client ID for a client secret, or username for a password; trimmed and lowercased before hashing.
 * @returns {string} Base64 encoded SHA-256 hash of secret + normalized_identifier.
 */
export function maskSecret(secret: string, identifier: string): string {
  // Normalize the identifier (trim and lowercase)
  const normalizedId = identifier.trim().toLowerCase();

  // Concatenate secret with normalized identifier
  const combined = `${secret}${normalizedId}`;

  // Create SHA-256 hash and return base64 encoded result
  return crypto.createHash("sha256").update(combined, "utf8").digest("base64");
}

/**
 * Optional audience, issuer, scope, environment, clock, and skew constraints applied by
 * access-token validation in addition to fixed cryptographic policy.
 */
export interface AccessTokenValidationOptions {
  /** Client identifier required in both client_id and the audience list when supplied. */
  clientId?: string;

  /** Exact issuer claim required after signature verification when supplied. */
  issuer?: string;

  /** Scopes that must each occur in the whitespace-delimited scope claim. */
  requiredScopes?: readonly string[];

  /** Exact iracing_env claim required when supplied; null requires a null claim. */
  expectedEnvironment?: string | null;

  /** Clock tolerance in seconds for expiry, issue, and authentication times; defaults to five. */
  clockSkewSeconds?: number;
}

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
 * Decodes and schema-checks JWT headers and claims without verifying the signature.
 * @param {string} accessToken - Compact JWT whose untrusted header and payload should be decoded.
 * @returns {OAuthJWTAccessToken} Schema-validated header and claims that remain untrusted until signature verification.
 *
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html|iRacing access tokens}
 * @throws {Error} If the token is not a valid JWT or does not match the expected access-token schema.
 */
export function decodeAccessToken(accessToken: string): OAuthJWTAccessToken {
  const header = OAuthJWTAccessTokenHeaderSchema.parse(
    decodeProtectedHeader(accessToken),
  );

  const payload = OAuthJWTAccessTokenPayloadSchema.parse(
    decodeJwt(accessToken),
  );

  return OAuthJWTAccessTokenSchema.parse({ header, payload });
}

/**
 * Verifies an access token with the iRacing JWKS endpoint and validates its shape.
 *
 * This performs signature verification before any claims are trusted.
 * Remote JWK sets are cached by the schema-validated jku URL for this process.
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html|iRacing access tokens}
 * @param {string} accessToken - Compact JWT carrying the schema-validated key-set URL.
 * @returns {Promise<OAuthJWTAccessToken>} Signature-verified header and payload; caller-specific claims constraints are not applied.
 *
 * @throws {Error} If the token cannot be decoded, verified, or parsed into the expected shape.
 */
export async function verifyAccessToken(
  accessToken: string,
): Promise<OAuthJWTAccessToken> {
  const decoded = decodeAccessToken(accessToken);

  const jwks = getRemoteJWKSet(decoded.header.jku);

  const { protectedHeader, payload } = await jwtVerify(accessToken, jwks, {
    algorithms: [...OAuthJWTAccessTokenAlgorithmValues],
    clockTolerance: 5,
  });

  const header = OAuthJWTAccessTokenHeaderSchema.parse(protectedHeader);

  const parsedPayload = OAuthJWTAccessTokenPayloadSchema.parse(payload);

  return OAuthJWTAccessTokenSchema.parse({
    header,
    payload: parsedPayload,
  });
}

/**
 * Verifies the signature before checking fixed audience, token times, and caller-selected claims.
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html#claims-validation|iRacing claims validation}
 * @param {string} accessToken - Compact JWT to verify before applying caller-selected claims constraints.
 * @param {AccessTokenValidationOptions} options - Claims constraints and clock tolerance; omitted constraints are not checked.
 * @returns {Promise<OAuthJWTAccessToken>} Verified token satisfying fixed audience and caller-selected claims constraints.
 *
 * @throws {Error} If the token cannot be verified before validation.
 * @throws {Error} If the token is expired or its time-based claims are inconsistent.
 * @throws {Error} If the issuer, client id, audience, environment, or required scopes do not match.
 */
export async function validateAccessToken(
  accessToken: string,
  options: AccessTokenValidationOptions = {},
): Promise<OAuthJWTAccessToken> {
  const token = await verifyAccessToken(accessToken);

  validateTokenTimes(token, options);

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

  validateRequiredScopes(token, options.requiredScopes);

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
 * @param {string} accessToken - Compact JWT to decode; opaque credentials cannot be inspected by this helper.
 * @returns {boolean} True when the current millisecond clock is past exp in seconds; missing exp is treated as zero.
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html|iRacing access tokens}
 */
export function isAccessTokenExpired(accessToken: string) {
  return isJWTExpired(accessToken);
}

/**
 * Returns whether an access token is still valid.
 *
 * @throws {Error} If the token is not a valid JWT.
 * @param {string} accessToken - Compact JWT to decode; opaque credentials cannot be inspected by this helper.
 * @returns {boolean} True when the current millisecond clock is at or before exp in seconds; missing exp is treated as zero.
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html|iRacing access tokens}
 */
export function isAccessTokenValid(accessToken: string) {
  return !isAccessTokenExpired(accessToken);
}

/**
 * Returns whether a refresh token is expired.
 *
 * @throws {Error} If the token is not a valid JWT.
 * @param {string} refreshToken - Compact JWT to decode; opaque credentials cannot be inspected by this helper.
 * @returns {boolean} True when the current millisecond clock is past exp in seconds; missing exp is treated as zero.
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html|iRacing access tokens}
 */
export function isRefreshTokenExpired(refreshToken: string) {
  return isJWTExpired(refreshToken);
}

/**
 * Returns whether a refresh token is still valid.
 *
 * @throws {Error} If the token is not a valid JWT.
 * @param {string} refreshToken - Compact JWT to decode; opaque credentials cannot be inspected by this helper.
 * @returns {boolean} True when the current millisecond clock is at or before exp in seconds; missing exp is treated as zero.
 * @see {@link https://oauth.iracing.com/oauth2/book/access_token.html|iRacing access tokens}
 */
export function isRefreshTokenValid(refreshToken: string) {
  return !isRefreshTokenExpired(refreshToken);
}

function validateTokenTimes(
  token: OAuthJWTAccessToken,
  options: AccessTokenValidationOptions,
) {
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
}

function validateRequiredScopes(
  token: OAuthJWTAccessToken,
  requiredScopes: readonly string[] | undefined,
) {
  if (requiredScopes?.length) {
    const grantedScopes = new Set(
      (token.payload.scope ?? "")
        .split(/\s+/)
        .map((scope) => scope.trim())
        .filter(Boolean),
    );

    for (const scope of requiredScopes) {
      if (!grantedScopes.has(scope)) {
        throw OAuthClaimsError.scopeMissing(scope);
      }
    }
  }
}
