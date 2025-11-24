import crypto from "node:crypto";
import { IRacingOAuthTokenResponse } from "@iracing-data/oauth-schema";

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

/**
 * HACK: The iRacing Authorization Server doesn't respond in the
 * format that oauth4webapi expects. We need to delete values
 * that may be null.
 */
export async function sanitizeTokenResponse(
  response: Response
): Promise<Response> {
  const token = (await response.clone().json()) as IRacingOAuthTokenResponse;

  if (token?.refresh_token === null) {
    delete token.refresh_token;
  }

  if (token?.refresh_token_expires_in === null) {
    delete token.refresh_token_expires_in;
  }

  if (token?.scope === null) {
    delete token.scope;
  }

  return new Response(JSON.stringify(token), {
    status: response.status,
    headers: response.headers,
  });
}
