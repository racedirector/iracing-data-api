import {
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
        url: "https://oauth.iracing.com",
        description: "iRacing OAuth server.",
      },
    ],
    externalDocs: {
      url: "/oauth2/book",
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
      },
    },
    paths: {
      "/oauth2/iracing/profile": {
        get: {
          responses: {
            200: {
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
      "/oauth2/sessions": {
        get: {
          responses: {
            200: {
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
      "/oauth2/revoke/current": {
        post: {
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
      "/oauth2/revoke/sessions": {
        post: {
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
      "/oauth2/revoke/client": {
        post: {
          responses: {
            200: { $ref: "#/components/responses/SessionsRevoked" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/oauth2/authorize": {
        get: {
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
      "/oauth2/token": {
        post: {
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
              content: {
                "application/json": { schema: IRacingOAuthTokenResponseSchema },
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
