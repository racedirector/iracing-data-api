import { IRacingOAuthTokenResponse } from "@iracing-data/oauth-schema";
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
