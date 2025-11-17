import { z } from "zod/v4";

const DEFAULT_OAUTH_URL = "https://oauth.iracing.com/oauth2";
const DEFAULT_AUTH_URL = `${DEFAULT_OAUTH_URL}/authorize`;
const DEFAULT_TOKEN_URL = `${DEFAULT_OAUTH_URL}/token`;

export const IRacingOAuthBaseURL = z.literal(DEFAULT_OAUTH_URL).meta({
  id: "iracingOAuthURL",
  title: "iRacing OAuth Service URL",
  description: "The URL for the iRacing OAuth service",
});

export const IRacingOAuthAuthorizationURL = z
  .templateLiteral([IRacingOAuthBaseURL, "/authorize"])
  .meta({
    id: "iracingOAuthAuthorizationURL",
    title: "iRacing OAuth Service Authorization Endpoint",
    description: "The endpoint for authorization.",
  });

export const IRacingOAuthTokenURL = z
  .templateLiteral([IRacingOAuthBaseURL, "/token"])
  .meta({
    id: "iracingOAuthTokenURL",
    title: "iRacing OAuth Service Token Endpoint",
    description: "The endpoint for token exchange.",
  });

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
        note: "The default is acceptable in 99.9% of use-cases, but is able to be overridden in case iRacing makes changes to the URLs.",
      }),
    tokenUrl: z
      .url()
      .default(DEFAULT_TOKEN_URL)
      .meta({
        id: "tokenUrl",
        title: "Token URL",
        description: `The URL to use when making token requests. Defaults to "${DEFAULT_TOKEN_URL}"`,
        note: "The default is acceptable in 99.9% of use-cases, but is able to be overridden in case iRacing makes changes to the URLs.",
      }),
    issuer: z
      .url()
      .default(DEFAULT_OAUTH_URL)
      .meta({
        id: "issuer",
        title: "Issuer",
        description: `The OAuth2.0 issuer to use in discovery cases. Defaults to "${DEFAULT_OAUTH_URL}"`,
        note: "The default is acceptable in 99.9% of use-cases, but is able to be overridden in case iRacing makes changes to the URLs.",
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
    clientSecret: z.string().optional().meta({
      id: "clientSecret",
      title: "Client secret",
      description:
        "The client secret optionally provided by iRacing during client registration. See: https://oauth.iracing.com/oauth2/book/client_registration.html",
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

/**
 * Type exports
 */

export type IRacingOAuthURL = z.infer<typeof IRacingOAuthBaseURL>;
export type IRacingAuthorizationURL = z.infer<
  typeof IRacingOAuthAuthorizationURL
>;
export type IRacingTokenURL = z.infer<typeof IRacingOAuthTokenURL>;

export type IRacingOAuthScope = z.infer<typeof IRacingOAuthScopeSchema>;

export type IRacingOAuthClientMetadataInput = z.input<
  typeof IRacingOAuthClientMetadataSchema
>;

export type IRacingOAuthClientMetadata = z.infer<
  typeof IRacingOAuthClientMetadataSchema
>;
