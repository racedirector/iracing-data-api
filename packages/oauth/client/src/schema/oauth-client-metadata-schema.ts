import { z } from "zod/v4";
import { BASE_URL } from "../constants";
import { OAuthScopeSchema } from "./oauth-scope-schema";

const DEFAULT_AUTH_URL = `${BASE_URL}/authorize`;
const DEFAULT_TOKEN_URL = `${BASE_URL}/token`;

export const OAuthClientMetadataSchema = z
  .object({
    authorizationUrl: z
      .url()
      .default(`${BASE_URL}/authorize`)
      .meta({
        id: "authorizationUrl",
        title: "Authorization URL",
        description: `The URL to use when making authorization requests. Defaults to "${DEFAULT_AUTH_URL}"`,
      }),
    tokenUrl: z
      .url()
      .default(`${BASE_URL}/token`)
      .meta({
        id: "tokenUrl",
        title: "Token URL",
        description: `The URL to use when making token requests. Defaults to "${DEFAULT_TOKEN_URL}"`,
      }),
    issuer: z
      .url()
      .default(BASE_URL)
      .meta({
        id: "issuer",
        title: "Issuer",
        description: `The OAuth2.0 issuer to use in discovery cases. Defaults to "${BASE_URL}"`,
      }),
    scopes: OAuthScopeSchema.optional(),
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

export type OAuthClientMetadataInput = z.input<
  typeof OAuthClientMetadataSchema
>;

export type OAuthClientMetadata = z.infer<typeof OAuthClientMetadataSchema>;
