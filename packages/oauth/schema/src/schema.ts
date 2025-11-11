import { z } from "zod";

/**
 * OAuth2 schema
 */

// Primitives

export const IRacingOAuthClientIdSchema = z.string().meta({
  description: "The client identifier issued during client registration.",
});

// Headers

export const IRacingOAuthRequestIdHeaderKey = "x-request-id";
export const IRacingOAuthRequestIdHeaderSchema = z.string().meta({
  title: "Request ID",
  description:
    "Each incoming request is assigned a request identifier. The request identifier is used to associate log messages with the request. Please include the value of the received x-request-id header when reporting issues.",
  header: {
    id: IRacingOAuthRequestIdHeaderKey,
  },
});

export const IRacingOAuthHeadersSchema = z.object({
  [IRacingOAuthRequestIdHeaderKey]: IRacingOAuthRequestIdHeaderSchema,
});

// Requests and responses

export const IRacingOAuthAuthorizeParametersSchema = z.object({
  client_id: IRacingOAuthClientIdSchema,
  redirect_uri: z.url().meta({
    description:
      "A redirect URI registered to the client, which must match exactly.",
  }),
  response_type: z.literal("code").meta({
    description: "The only valid value for this is code.",
  }),
  code_challenge: z.string().optional().meta({
    description:
      "A PKCE code challenge. We require this of any client which cannot reasonably keep a secret, and encourage server-side applications to implement it regardless.",
  }),
  code_challenge_method: z
    .union([z.literal("plain"), z.literal("S256")])
    .default("plain")
    .optional()
    .meta({
      description:
        "The PKCE code challenge method. Either S256 (recommended) or plain.",
    }),
  state: z.string().optional().meta({
    description:
      "This state value will be returned unmodified at the end of the authentication and authorization flow. It may be used to store request-specific data and in the prevention of CSRF attacks.",
  }),
  scope: z.string().optional().meta({
    description:
      "One or more scopes to request, if any, separated by whitespace.",
  }),
  prompt: z.string().optional().meta({
    description:
      "Space-delimited, case-sensitive list of ASCII string values which influence how the authorization server interacts with the user.",
  }),
});

export const IRacingOAuthTokenAuthorizationCodeGrantParametersSchema = z.object(
  {
    grant_type: z.literal("authorization_code"),
    client_id: IRacingOAuthClientIdSchema,
    client_secret: z
      .string()
      .optional()
      .meta({ description: "Required only if issued." }),
    code: z
      .string()
      .meta({ description: "As returned to the redirect_uri of the client." }),
    redirect_uri: z.string().meta({
      description: "The same redirect_uri used to `/authorize`.",
    }),
    code_verifier: z.string().optional().meta({
      description:
        "The PKCE code verifier which is only required if a code_challenge was used to `/authorize``.",
    }),
  }
);

export const IRacingOAuthTokenRefreshGrantParametersSchema = z.object({
  grant_type: z.literal("authorization_code"),
  client_id: IRacingOAuthClientIdSchema,
  client_secret: z
    .string()
    .optional()
    .meta({ description: "Required only if issued." }),
  refresh_token: z.string().meta({
    description: "As returned in the `/token` response.",
  }),
});

export const IRacingOAuthTokenParametersSchema = z.discriminatedUnion(
  "grant_type",
  [
    IRacingOAuthTokenAuthorizationCodeGrantParametersSchema,
    IRacingOAuthTokenRefreshGrantParametersSchema,
  ]
);

export const IRacingOAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_token_expires_in: z.number().optional(),
  scope: z.string().trim(),
});

export const IRacingOAuthSessionSchema = z.object({
  session_id: z.string().meta({
    description:
      "A session identifier. This value is considered opaque and its format may change without warning at our discretion.",
  }),
  client_id: z.string().meta({
    description: "A client identifier.",
  }),
  client_name: z.string().meta({
    description:
      "The name of the client as selected during client registration.",
  }),
  client_developer_name: z.string().nullable(),
  client_developer_url: z.string().nullable(),
  client_developer_email: z.string().nullable(),
  scope: z.string().nullable(),
  scope_descriptions: z.string().nullable(),
  // auth_time:
  // last_activity:
  // session_expiration
  current_session: z.boolean(),
  impersonated: z.boolean(),
  impersonation_note: z.string().nullable(),
  first_ip: z.ipv4().nullable(),
  first_continent: z.string().nullable(),
  first_country: z.string().nullable(),
  first_subdivisions: z.string().nullable(),
  first_city: z.string().nullable(),
  first_user_agent_header: z.string().nullable(),
  first_user_agent_operating_system: z.string().nullable(),
  first_user_agent_browser: z.string().nullable(),
  last_ip: z.ipv4().nullable(),
  last_continent: z.string().nullable(),
  last_country: z.string().nullable(),
  last_subdivisions: z.string().nullable(),
  last_city: z.string().nullable(),
  last_user_agent_header: z.string().nullable(),
  last_user_agent_operating_system: z.string().nullable(),
  last_user_agent_browser: z.string().nullable(),
});

export const IRacingOAuthSessionsSchema = z.object({
  sessions: z.array(IRacingOAuthSessionSchema),
});

export const IRacingOAuthProfileResponseSchema = z.object({
  iracing_name: z.string(),
  iracing_cust_id: z.number(),
});

export const IRacingOAuthRevokeCurrentSessionInputSchema = z.object({
  forgetBrowser: z.boolean().optional(),
});

export const IRacingOAuthRevokeSessionsInputSchema = z.object({
  sessionIds: z.array(z.string()),
});

// Types
export type IRacingOAuthClientId = z.infer<typeof IRacingOAuthClientIdSchema>;
export type IRacingOAuthRequestIdHeader = z.infer<
  typeof IRacingOAuthRequestIdHeaderSchema
>;
export type IRacingOAuthHeaders = z.infer<typeof IRacingOAuthHeadersSchema>;
export type IRacingOAuthAuthorizeParameters = z.infer<
  typeof IRacingOAuthAuthorizeParametersSchema
>;
export type IRacingOAuthTokenAuthorizationCodeGrantParameters = z.infer<
  typeof IRacingOAuthTokenAuthorizationCodeGrantParametersSchema
>;
export type IRacingOAuthTokenRefreshGrantParameters = z.infer<
  typeof IRacingOAuthTokenRefreshGrantParametersSchema
>;
export type IRacingOAuthTokenParameters = z.infer<
  typeof IRacingOAuthTokenParametersSchema
>;
export type IRacingOAuthTokenResponse = z.infer<
  typeof IRacingOAuthTokenResponseSchema
>;
export type IRacingOAuthSession = z.infer<typeof IRacingOAuthSessionSchema>;
export type IRacingOAuthSessions = z.infer<typeof IRacingOAuthSessionsSchema>;
export type IRacingOAuthProfileResponse = z.infer<
  typeof IRacingOAuthProfileResponseSchema
>;
export type IRacingOAuthRevokeCurrentSessionParameters = z.infer<
  typeof IRacingOAuthRevokeCurrentSessionInputSchema
>;
export type IRacingOAuthRevokeSessionsParameters = z.infer<
  typeof IRacingOAuthRevokeSessionsInputSchema
>;
