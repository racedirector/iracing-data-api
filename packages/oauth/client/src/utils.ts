import crypto from "node:crypto";

export type OAuthTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string | null;
  refresh_token_expires_in?: string | null;
  scope?: string | null;
};

/**
 * HACK: The iRacing Authorization Server doesn't respond in the
 * format that oauth4webapi expects. We need to delete values
 * that may be null.
 */
export async function sanitizeTokenResponse(
  response: Response
): Promise<Response> {
  const token = (await response.clone().json()) as OAuthTokenResponse;

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

/**
 * Compute the Base64‑encoded SHA‑256 hash of (password + email.toLowerCase()).
 */
export async function hashPassword(email: string, password: string) {
  return crypto
    .createHash("sha256")
    .update(password + email.toLowerCase())
    .digest("base64");
}
