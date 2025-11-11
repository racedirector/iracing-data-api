import { createEndpoint } from "../utils";

export const getCarClass = createEndpoint(
  "/data/carclass/get",
  {
    method: "GET",
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
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    link: {
                      type: "url",
                      description: "A link to the cached data response.",
                    },
                    expires: {
                      type: "number",
                      description:
                        "Duration in seconds until the data is considered stale.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.carClass.get();
    return response.data;
  }
);
