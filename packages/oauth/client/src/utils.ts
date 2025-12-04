import { jwtDecode } from "jwt-decode";
import crypto from "node:crypto";

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

function isJWTExpired(token: string) {
  const { exp } = jwtDecode(token);
  const expiry = new Date(exp! * 1000);
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
