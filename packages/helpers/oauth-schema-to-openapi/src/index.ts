import {
  OAuthErrorResponseSchema,
  OAuthAuthorizeParametersSchema,
  OAuthHeadersSchema,
  OAuthProfileResponseSchema,
  OAuthRequestIdHeaderSchema,
  OAuthRevokeCurrentSessionInputSchema,
  OAuthRevokeSessionsInputSchema,
  OAuthSessionsSchema,
  OAuthTokenParametersSchema,
  OAuthTokenResponseSchema,
} from "@iracing-data/oauth-schema";
import { createDocument } from "zod-openapi";

export const document = createDocument({
  openapi: "3.1.1",
  info: {
    title: "iRacing OAuth API",
    version: "0.0.1",
  },
  servers: [
    {
      url: "https://oauth.iracing.com/oauth2",
      description: "iRacing OAuth server.",
    },
  ],
  externalDocs: {
    url: "/book",
  },
  components: {
    headers: {
      oAuthRequestId: OAuthRequestIdHeaderSchema,
    },
    responses: {
      SessionsRevoked: {
        headers: OAuthHeadersSchema,
        description: "Session(s) were successfully revoked.",
      },
      Unauthorized: {
        description: "Access token is missing or invalid.",
        headers: OAuthHeadersSchema,
        content: {
          "application/json": {
            schema: OAuthErrorResponseSchema,
          },
        },
      },
      Forbidden: {
        description: "The request is forbidden.",
        headers: OAuthHeadersSchema,
        content: {
          "application/json": {
            schema: OAuthErrorResponseSchema,
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authentication",
      },
    },
  },
  paths: {
    "/iracing/profile": {
      get: {
        operationId: "getProfile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            headers: OAuthHeadersSchema,
            content: {
              "application/json": {
                schema: OAuthProfileResponseSchema,
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/sessions": {
      get: {
        operationId: "getSessions",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            headers: OAuthHeadersSchema,
            content: {
              "application/json": {
                schema: OAuthSessionsSchema,
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/revoke/current": {
      post: {
        operationId: "revokeCurrent",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: OAuthRevokeCurrentSessionInputSchema,
            },
          },
        },
        responses: {
          200: { $ref: "#/components/responses/SessionsRevoked" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/revoke/sessions": {
      post: {
        operationId: "revokeSessions",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: OAuthRevokeSessionsInputSchema,
              encoding: {
                session_ids: {
                  style: "form",
                  explode: false,
                },
              },
            },
          },
        },
        responses: {
          200: { $ref: "#/components/responses/SessionsRevoked" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/revoke/client": {
      post: {
        operationId: "revokeClient",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { $ref: "#/components/responses/SessionsRevoked" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/authorize": {
      get: {
        operationId: "authorize",
        requestParams: {
          query: OAuthAuthorizeParametersSchema,
        },
        responses: {
          302: {
            description: "Redirect back to the provided redirect_uri",
          },
        },
      },
    },
    "/token": {
      post: {
        operationId: "exchangeToken",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: OAuthTokenParametersSchema,
            },
          },
        },
        responses: {
          200: {
            description: "Success",
            headers: OAuthHeadersSchema,
            content: {
              "application/json": { schema: OAuthTokenResponseSchema },
            },
          },
          400: {
            description: "Failure",
            headers: OAuthHeadersSchema,
            content: {
              "application/json": { schema: OAuthErrorResponseSchema },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
});

export default document;
