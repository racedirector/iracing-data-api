import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from "jose";

/** Provider-neutral JWT verification constraints used by resource servers. */
export interface RemoteJwtVerificationOptions {
  readonly issuer: string;
  readonly audience: string;
  readonly jwksUrl: string;
}

/** Result of cryptographically verified JWT claims. */
export interface VerifiedJwt {
  readonly payload: JWTPayload;
}

/**
 * Creates a standards-based JWT verifier backed by a remote JWKS. The optional
 * resolver seam permits deterministic local-key tests without network access.
 */
export function createRemoteJwtVerifier(
  options: RemoteJwtVerificationOptions,
  keySet: JWTVerifyGetKey = createRemoteJWKSet(new URL(options.jwksUrl)),
) {
  return async (token: string): Promise<VerifiedJwt> => {
    const { payload } = await jwtVerify(token, keySet, {
      issuer: options.issuer,
      audience: options.audience,
    });

    return { payload };
  };
}
