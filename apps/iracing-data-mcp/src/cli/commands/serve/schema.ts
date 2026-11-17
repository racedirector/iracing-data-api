import {
  IRacingOAuthClientMetadataSchema,
  OAuthTokenResponseSchema,
} from "@iracing-data/oauth-client";
import { z } from "zod";

const HostSchema = z.string().min(1).default("127.0.0.1");

const PortSchema = z.coerce.number().int().min(1).max(65535).default(3000);

const TransportOptionsSchema = z.discriminatedUnion("transport", [
  z.object({
    transport: z.literal("stdio"),
  }),
  z.object({
    transport: z.literal("http"),
    host: HostSchema,
    port: PortSchema,
  }),
]);

const metadata = IRacingOAuthClientMetadataSchema.shape;

const CredentialsOptionsSchema = z.object({
  credentialsFile: z.string().trim().min(1),
  clientId: metadata.clientId.trim().min(1),
  clientSecret: metadata.clientSecret,
  maskedClientSecret: metadata.maskedClientSecret,
  username: metadata.username,
  password: metadata.password,
  maskedPassword: metadata.maskedPassword,
  redirectUri: metadata.redirectUri,
});

const AccessTokenAuthenticationSchema = z
  .object({
    accessToken: OAuthTokenResponseSchema.shape.access_token,
  })
  .transform(({ accessToken }) => ({
    kind: "access_token" as const,
    accessToken,
  }));

const OAuthAuthenticationSchema = CredentialsOptionsSchema.transform(
  ({ credentialsFile, ...metadata }) => ({
    credentialsFile,
    clientMetadata: {
      ...metadata,
      scopes: ["iracing.auth"],
    },
  }),
)
  .pipe(
    z.object({
      credentialsFile: z.string().trim().min(1),
      clientMetadata: IRacingOAuthClientMetadataSchema,
    }),
  )
  .transform(({ credentialsFile, clientMetadata }) => ({
    kind: clientMetadata.username
      ? ("password_limited" as const)
      : ("authorization_code" as const),
    credentialsFile,
    clientMetadata,
  }));

/**
 * Schema for declaring authentication method.
 */
export const AuthenticationOptionsSchema = z.union([
  AccessTokenAuthenticationSchema,
  OAuthAuthenticationSchema,
]);

/**
 * Values required for declaring authentication method.
 */
export type AuthenticationOptions = z.output<
  typeof AuthenticationOptionsSchema
>;

/**
 * Serve command options.
 */
export const ServeOptionsSchema = z.intersection(
  AuthenticationOptionsSchema,
  TransportOptionsSchema,
);

export type ServeOptions = z.infer<typeof ServeOptionsSchema>;
