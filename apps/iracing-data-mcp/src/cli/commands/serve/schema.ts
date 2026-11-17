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

const AuthenticationOptionsSchema = z.union([
  z.object({
    accessToken: OAuthTokenResponseSchema.shape.access_token,
  }),
  z.object({
    credentials: z.string().min(1).trim(),
    clientId: IRacingOAuthClientMetadataSchema.shape.clientId,
    clientSecret: IRacingOAuthClientMetadataSchema.shape.clientSecret,
    maskedClientSecret:
      IRacingOAuthClientMetadataSchema.shape.maskedClientSecret,
    username: IRacingOAuthClientMetadataSchema.shape.username,
    password: IRacingOAuthClientMetadataSchema.shape.password,
    maskedPassword: IRacingOAuthClientMetadataSchema.shape.maskedPassword,
    redirectUri: IRacingOAuthClientMetadataSchema.shape.redirectUri,
  }),
]);

/**
 * Options for starting an MCP server.
 */
export const ServeOptionsSchema = z.intersection(
  AuthenticationOptionsSchema,
  TransportOptionsSchema,
);
export type ServeOptions = z.infer<typeof ServeOptionsSchema>;
