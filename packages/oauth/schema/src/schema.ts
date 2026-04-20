import { z } from "zod";

/**
 * OAuth2 schema
 */

// Primitives

export const IRacingOAuthClientIdSchema = z.string().meta({
  description: "The client identifier issued during client registration.",
});

export const IRacingOAuthClientSecretSchema = z.string().meta({
  description: "The client secret issued during registration.",
});

export const IRacingOAuthScopeAuthSchema = z.literal("iracing.auth").meta({
  description: "OAuth scope that grants authorization for iRacing services.",
});

export const IRacingOAuthScopeProfileSchema = z
  .literal("iracing.profile")
  .meta({
    description: "OAuth scope that grants access to the iRacing profile.",
  });

export const IRacingOAuthScopesSchema = z.union([
  IRacingOAuthScopeAuthSchema,
  IRacingOAuthScopeProfileSchema,
]);

export const IRacingOAuthScopesStringSchema = z.string().optional().meta({
  description:
    "One or more scopes to request, if any, separated by whitespace.",
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

export const IRacingOAuthErrorResponseSchema = z.object({
  status: z.number(),
  status_reason: z.string(),
  error: z.string(),
  error_description: z.string(),
  error_uri: z.string(),
  state: z.string().optional(),
});

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
  scope: IRacingOAuthScopesStringSchema.optional(),
  prompt: z.string().optional().meta({
    description:
      "Space-delimited, case-sensitive list of ASCII string values which influence how the authorization server interacts with the user.",
  }),
});

export const IRacingOAuthCllbackParametersSchema = z
  .object({
    state: z.string(),
    code: z.string(),
  })
  .meta({
    description:
      "Parameters are added to the query string of the `redirect_uri`.",
  });

export const IRacingOAuthTokenAuthorizationCodeGrantParametersSchema = z
  .object({
    grant_type: z.literal("authorization_code"),
    client_id: IRacingOAuthClientIdSchema,
    client_secret: IRacingOAuthClientSecretSchema.optional(),
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
  })
  .meta({
    id: "authorizationCodeGrant",
  });

export const IRacingOAuthTokenRefreshGrantParametersSchema = z
  .object({
    grant_type: z.literal("refresh_token"),
    client_id: IRacingOAuthClientIdSchema,
    client_secret: IRacingOAuthClientSecretSchema.optional(),
    refresh_token: z.string().meta({
      description: "As returned in the `/token` response.",
    }),
  })
  .meta({
    id: "refreshTokenGrant",
  });

export const IRacingOAuthPasswordLimitedGrantParametersSchema = z
  .object({
    grant_type: z.literal("password_limited"),
    client_id: IRacingOAuthClientIdSchema,
    client_secret: IRacingOAuthClientSecretSchema,
    username: z.string().meta({
      description: "The email address or other issued identifier for a user.",
    }),
    password: z.string().meta({
      description:
        "The password of the user. Password must be masked with the `username` before it is sent to the server.",
    }),
    scope: IRacingOAuthScopesStringSchema.optional(),
  })
  .meta({
    id: "passwordLimitedGrant",
  });

export const IRacingOAuthTokenParametersSchema = z
  .discriminatedUnion("grant_type", [
    IRacingOAuthTokenAuthorizationCodeGrantParametersSchema,
    IRacingOAuthTokenRefreshGrantParametersSchema,
    IRacingOAuthPasswordLimitedGrantParametersSchema,
  ])
  .meta({
    id: "tokenGrantParameters",
  });

export const IRacingOAuthTokenResponseSchema = z
  .object({
    access_token: z.string().meta({
      description:
        "The access token may be used to authorize a connection to a resource server. The value is considered opaque and its format may change without warning at our discretion.",
    }),
    token_type: z.literal("bearer"),
    expires_in: z.number().meta({
      description:
        "The number of seconds after which this access token will no longer be considered valid.",
    }),
    refresh_token: z.string().optional().meta({
      description:
        "The refresh token may be used in a Refresh Token Grant to obtain new access and refresh tokens. Each refresh token may only be used once. The value is considered opaque and its format may change without warning at our discretion.",
    }),
    refresh_token_expires_in: z.number().optional().meta({
      description:
        "The number of seconds after which this refresh token will no longer be considered valid. The server may not issue a refresh token, in which case this field will be omitted.",
    }),
    scope: IRacingOAuthScopesStringSchema.optional(),
  })
  .meta({
    id: "tokenGrantResponse",
  });

export const IRacingOAuthJWTAccessTokenAlgorithmValues = [
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
  "PS256",
  "PS384",
  "PS512",
  "ES256K",
  "EdDSA",
] as const;

export const IRacingOAuthJWTAccessTokenAlgorithmSchema = z
  .string()
  .trim()
  .pipe(z.enum(IRacingOAuthJWTAccessTokenAlgorithmValues))
  .meta({
    id: "jwtAccessTokenAlgorithm",
    title: "JWT Access Token Algorithm",
    description:
      "The signed JWT algorithm used by the iRacing access token header. `none` is explicitly disallowed.",
  });

export const IRacingOAuthJWTAccessTokenHeaderSchema = z
  .object({
    kid: z.string().min(1).meta({
      description:
        "The key identifier used to look up the correct signing key in the JWKS document.",
    }),
    alg: IRacingOAuthJWTAccessTokenAlgorithmSchema,
    jku: z.url().refine(
      (value) => {
        const url = new URL(value);

        return (
          url.protocol === "https:" &&
          url.username === "" &&
          url.password === "" &&
          url.search === "" &&
          url.hash === "" &&
          url.hostname.endsWith(".iracing.com")
        );
      },
      {
        error:
          "The `jku` claim must be an HTTPS URL on the `iracing.com` domain without user info, query, or fragment components.",
      },
    ),
  })
  .meta({
    id: "jwtAccessTokenHeader",
    title: "JWT Access Token Header",
    description:
      "The decoded JWS header for an iRacing access token. See: https://oauth.iracing.com/oauth2/book/access_token.html",
  });

export const IRacingOAuthJWTAccessTokenPayloadSchema = z
  .object({
    session_id: z.uuid().meta({
      description: "The UUID identifier of the session.",
    }),
    iss: z.url().meta({
      description:
        "The issuer of the access token; the authorization server.",
    }),
    exp: z.number().int().nonnegative().meta({
      description:
        "The expiration time of the access token in seconds since the Unix epoch.",
    }),
    aud: z.array(z.string().min(1)).meta({
      description:
        "The audiences for which the access token is valid.",
    }),
    sub: z.string().nullable().meta({
      description:
        "The subject of the access token. This claim may be null.",
    }),
    client_id: z.string().min(1).meta({
      description: "The identifier of the client application.",
    }),
    iat: z.number().int().nonnegative().meta({
      description:
        "The time of issue of the access token in seconds since the Unix epoch.",
    }),
    jti: z.uuid().meta({
      description: "A UUID identifying this access token.",
    }),
    auth_time: z.number().int().nonnegative().meta({
      description:
        "The time the authentication and authorization process completed.",
    }),
    scope: z.string().nullable().meta({
      description:
        "The granted scopes separated by whitespace. This claim may be null.",
    }),
    iracing_env: z.string().nullable().meta({
      description:
        "The iRacing environment associated with the token. This claim may be null.",
    }),
    iracing_cust_id: z.number().int().nonnegative().nullable().meta({
      description:
        "The numeric iRacing customer identifier of the subject. This claim may be null.",
    }),
    iracing_group_ids: z.array(z.number().int().nonnegative()).nullable().meta({
      description:
        "The numeric iRacing group identifiers assigned to the subject. This claim may be null.",
    }),
  })
  .meta({
    id: "jwtAccessTokenPayload",
    title: "JWT Access Token Payload",
    description:
      "The decoded payload for an iRacing access token. See: https://oauth.iracing.com/oauth2/book/access_token.html",
  });

export const IRacingOAuthJWTAccessTokenSchema = z
  .object({
    header: IRacingOAuthJWTAccessTokenHeaderSchema,
    payload: IRacingOAuthJWTAccessTokenPayloadSchema,
  })
  .meta({
    id: "jwtAccessToken",
    title: "JWT Access Token",
    description:
      "The decoded and parsed JWT access token structure for iRacing.",
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
export type IRacingOAuthClientSecret = z.infer<
  typeof IRacingOAuthClientSecretSchema
>;
export type IRacingOAuthScopeAuth = z.infer<typeof IRacingOAuthScopeAuthSchema>;
export type IRacingOAuthScopeProfile = z.infer<
  typeof IRacingOAuthScopeProfileSchema
>;
export type IRacingOAuthScopes = z.infer<typeof IRacingOAuthScopesSchema>;
export type IRacingOAuthScopesString = z.infer<
  typeof IRacingOAuthScopesStringSchema
>;
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
export type IRacingOAuthJWTAccessTokenAlgorithm = z.infer<
  typeof IRacingOAuthJWTAccessTokenAlgorithmSchema
>;
export type IRacingOAuthJWTAccessTokenHeader = z.infer<
  typeof IRacingOAuthJWTAccessTokenHeaderSchema
>;
export type IRacingOAuthJWTAccessTokenPayload = z.infer<
  typeof IRacingOAuthJWTAccessTokenPayloadSchema
>;
export type IRacingOAuthJWTAccessToken = z.infer<
  typeof IRacingOAuthJWTAccessTokenSchema
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
