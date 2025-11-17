import { OAuthClient, OAuthClientOptions } from "@iracing-data/oauth-client";
import { createMiddleware } from "better-call";
import { Configuration, DefaultApi } from "./client";
import { assert } from "console";

interface CreateIRacingOAuthClientMiddlewareOptions {
  oauthClient?: OAuthClient;
  clientOptions?: OAuthClientOptions;
}

export const createIRacingOAuthClientMiddleware = (
  options: CreateIRacingOAuthClientMiddlewareOptions
) => {
  assert(
    options.oauthClient || options.clientOptions,
    "An OAuth client or options must be provided."
  );

  return createMiddleware(async () => {
    return {
      oauth: options.oauthClient || new OAuthClient(options.clientOptions!),
    };
  });
};

export const iRacingSessionHeaderMiddleware = createMiddleware(
  {
    requireHeaders: true,
    metadata: {
      openapi: {
        parameters: [
          {
            in: "header",
            name: "X-IRACING-ACCESS-TOKEN",
            schema: {
              type: "string",
            },
            required: true,
            description: "The JWT token to sign the request with.",
          },
        ],
      },
    },
  },
  async ({ getHeader }) => ({
    iracingSession: getHeader("X-IRACING-ACCESS-TOKEN"),
  })
);

export const oauthServiceClientMiddleware = createMiddleware(
  {
    use: [iRacingSessionHeaderMiddleware],
  },
  async ({ context: { iracingSession } }) => ({
    oauthService: new DefaultApi(
      new Configuration({
        accessToken: iracingSession || undefined,
      })
    ),
  })
);
