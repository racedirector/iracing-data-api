import { createEndpoint } from "../utils";
import { z } from "zod";

export const seriesAssets = createEndpoint(
  "/data/series/assets",
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
    const response = await iracing.api.data.series.assets();
    return response.data;
  }
);

export const getSeries = createEndpoint(
  "/data/series/get",
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
    const response = await iracing.api.data.series.get();
    return response.data;
  }
);

export const pastSeasons = createEndpoint(
  "/data/series/past_seasons",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      seriesId: z.number(),
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
    const response = await iracing.api.data.series.pastSeasons(query);
    return response.data;
  }
);

export const seasons = createEndpoint(
  "/data/series/seasons",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      includeSeries: z.boolean().optional(),
      seasonYear: z.number().optional(),
      seasonQuarter: z.number().optional(),
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
    const response = await iracing.api.data.series.seasons(query);
    return response.data;
  }
);

export const seasonList = createEndpoint(
  "/data/series/season_list",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      includeSeries: z.boolean().optional(),
      seasonYear: z.number().optional(),
      seasonQuarter: z.number().optional(),
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
    const response = await iracing.api.data.series.seasonList(query);
    return response.data;
  }
);

export const seasonSchedule = createEndpoint(
  "/data/series/season_schedule",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      seasonId: z.number(),
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
    const response = await iracing.api.data.series.seasonSchedule(query);
    return response.data;
  }
);

export const statsSeries = createEndpoint(
  "/data/series/stats_series",
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
    const response = await iracing.api.data.series.statsSeries();
    return response.data;
  }
);
