import { z } from "zod/v4";
import { DEFAULT_AUTH_URL, DEFAULT_TOKEN_URL, BASE_URL } from "../constants";

// Allowed scopes. See: https://oauth.iracing.com/oauth2/book/scopes.html
export const IRacingOAuthScopeSchema = z.enum([
  "iracing.auth",
  "iracing.profile",
]);

export const IRacingOAuthScopesSchema = z
  .array(IRacingOAuthScopeSchema)
  .min(1)
  // Ensure uniqueness in the provided values
  .refine(
    (values) => new Set(values).size === values.length,
    "Each value must be unique."
  );

export const IRacingOAuthClientMetadataSchema = z
  .object({
    authorizationUrl: z
      .url()
      .default(DEFAULT_AUTH_URL)
      .meta({
        id: "authorizationUrl",
        title: "Authorization URL",
        description: `The URL to use when making authorization requests. Defaults to "${DEFAULT_AUTH_URL}"`,
        note: "The default is acceptable in 99% of use-cases, but is able to be overridden in case iRacing makes changes to the URLs.",
      }),
    tokenUrl: z
      .url()
      .default(DEFAULT_TOKEN_URL)
      .meta({
        id: "tokenUrl",
        title: "Token URL",
        description: `The URL to use when making token requests. Defaults to "${DEFAULT_TOKEN_URL}"`,
        note: "The default is acceptable in 99% of use-cases, but is able to be overridden in case iRacing makes changes to the URLs.",
      }),
    issuer: z
      .url()
      .default(BASE_URL)
      .meta({
        id: "issuer",
        title: "Issuer",
        description: `The OAuth2.0 issuer to use in discovery cases. Defaults to "${BASE_URL}"`,
        note: "The default is acceptable in 99% of use-cases, but is able to be overridden in case iRacing makes changes to the URLs.",
      }),
    scopes: IRacingOAuthScopesSchema.meta({
      id: "scopes",
      title: "Scopes",
      description:
        "The OAuth scopes that may be requested. See: https://oauth.iracing.com/oauth2/book/scopes.html",
    }),
    clientId: z.string().min(1).meta({
      id: "clientId",
      title: "Client ID",
      description:
        "The client ID provided by iRacing after client registration. See: https://oauth.iracing.com/oauth2/book/client_registration.html",
    }),
    redirectUri: z.url().meta({
      id: "redirectUri",
      title: "Redirect URI",
      description: "The redirect URI for your client from iRacing.",
      note: "`localhost` URLs are not allowed, be sure to use `127.0.0.1` instead.",
    }),
  })
  .refine(
    (value) => (value.authorizationUrl && value.tokenUrl) || value.issuer,
    {
      error:
        "Client must provide `authorizationUrl` and `tokenUrl` or `issuer`.",
    }
  )
  .meta({
    title: "Client Metadata",
    description: "Metadata the user must provide to use the client.",
  });

export const IRacingOAuthCallbackSchema = z.object({
  state: z.string(),
  code: z.string(),
});

export const IRacingOAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_token_expires_in: z.number().optional(),
  scope: z.string().trim(),
});

/**
 * Type exports
 */

export type IRacingOAuthScope = z.infer<typeof IRacingOAuthScopeSchema>;

export type IRacingOAuthClientMetadataInput = z.input<
  typeof IRacingOAuthClientMetadataSchema
>;

export type IRacingOAuthClientMetadata = z.infer<
  typeof IRacingOAuthClientMetadataSchema
>;

export type IRacingOAuthCallbackInput = z.infer<
  typeof IRacingOAuthCallbackSchema
>;

export type IRacingOAuthCallbackResponse = z.infer<
  typeof IRacingOAuthTokenResponseSchema
>;
