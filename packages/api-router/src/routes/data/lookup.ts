import { createEndpoint } from "../utils";
import { z } from "zod";

export const countries = createEndpoint(
  "/data/lookup/countries",
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
      },
    },
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.lookup.countries();
    return response.data;
  }
);

export const flairs = createEndpoint(
  "/data/lookup/flairs",
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
      },
    },
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.lookup.flairs();
    return response.data;
  }
);

export const licenses = createEndpoint(
  "/data/lookup/licenses",
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
      },
    },
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.lookup.licenses();
    return response.data;
  }
);

export const drivers = createEndpoint(
  "/data/lookup/drivers",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      searchTerm: z.string(),
      leagueId: z.number().optional(),
    }),
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
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.lookup.drivers(query);
    return response.data;
  }
);

export const getLookup = createEndpoint(
  "/data/lookup/get",
  {
    method: "GET",
    requireHeaders: true,
    query: z.record(z.string(), z.string()),
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
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.lookup.get(query);
    return response.data;
  }
);
