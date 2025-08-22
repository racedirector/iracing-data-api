import { z } from "zod/v4";
import { OAuthScopeSchema } from "./oauth-scope-schema";

export const BASE_URL = "https://oauth.iracing.com/oauth2";

export const OAuthClientMetadataSchema = z
  .object({
    authorizationUrl: z.url().default(`${BASE_URL}/authorize`),
    tokenUrl: z.url().default(`${BASE_URL}/token`),
    issuer: z.url().default(BASE_URL),
    scopes: OAuthScopeSchema.optional(),
    clientId: z.string().min(1),
    redirectUri: z.url(),
  })
  .refine(
    (value) => (value.authorizationUrl && value.tokenUrl) || value.issuer,
    {
      error:
        "Client must provide `authorizationUrl` and `tokenUrl` or `issuer`.",
    }
  );

export type OAuthClientMetadataInput = z.input<
  typeof OAuthClientMetadataSchema
>;

export type OAuthClientMetadata = z.infer<typeof OAuthClientMetadataSchema>;
