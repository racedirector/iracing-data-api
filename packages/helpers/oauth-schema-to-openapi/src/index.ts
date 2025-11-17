import {
  IRacingOAuthErrorResponseSchema,
  IRacingOAuthAuthorizeParametersSchema,
  IRacingOAuthHeadersSchema,
  IRacingOAuthProfileResponseSchema,
  IRacingOAuthRequestIdHeaderSchema,
  IRacingOAuthRevokeCurrentSessionInputSchema,
  IRacingOAuthRevokeSessionsInputSchema,
  IRacingOAuthSessionsSchema,
  IRacingOAuthTokenParametersSchema,
  IRacingOAuthTokenResponseSchema,
} from "@iracing-data/oauth-schema";
import fs from "node:fs";
import path from "node:path";
import { createDocument } from "zod-openapi";

export interface GenerateOpenAPISpecOptions {
  outputDir?: string;
  fileName?: string;
}

export async function generateOpenAPISpec({
  outputDir = __dirname,
  fileName = "openapi.json",
}: GenerateOpenAPISpecOptions) {
  const outputPath = path.join(outputDir, fileName);

  // Create the output dir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const document = createDocument({
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
        oAuthRequestId: IRacingOAuthRequestIdHeaderSchema,
      },
      responses: {
        SessionsRevoked: {
          headers: IRacingOAuthHeadersSchema,
          description: "Session(s) were successfully revoked.",
        },
        Unauthorized: {
          description: "Access token is missing or invalid.",
          content: {
            "application/json": {
              schema: IRacingOAuthErrorResponseSchema,
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
              headers: IRacingOAuthHeadersSchema,
              content: {
                "application/json": {
                  schema: IRacingOAuthProfileResponseSchema,
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
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
              headers: IRacingOAuthHeadersSchema,
              content: {
                "application/json": {
                  schema: IRacingOAuthSessionsSchema,
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
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
                schema: IRacingOAuthRevokeCurrentSessionInputSchema,
              },
            },
          },
          responses: {
            200: { $ref: "#/components/responses/SessionsRevoked" },
            401: { $ref: "#/components/responses/Unauthorized" },
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
                schema: IRacingOAuthRevokeSessionsInputSchema,
              },
            },
          },
          responses: {
            200: { $ref: "#/components/responses/SessionsRevoked" },
            401: { $ref: "#/components/responses/Unauthorized" },
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
          },
        },
      },
      "/authorize": {
        get: {
          operationId: "authorize",
          requestParams: {
            query: IRacingOAuthAuthorizeParametersSchema,
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
                schema: IRacingOAuthTokenParametersSchema,
              },
            },
          },
          responses: {
            200: {
              description: "Success",
              headers: IRacingOAuthHeadersSchema,
              content: {
                "application/json": { schema: IRacingOAuthTokenResponseSchema },
              },
            },
            400: {
              description: "Failure",
              headers: IRacingOAuthHeadersSchema,
              content: {
                "application/json": { schema: IRacingOAuthErrorResponseSchema },
              },
            },
          },
        },
      },
    },
  });

  // Remove the existing file
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Write to file.
  console.log(`Writing to ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(document));
}
