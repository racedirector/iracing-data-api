import { createEndpoint } from "../utils";
import { z } from "zod";

export const awards = createEndpoint(
  "/data/member/awards",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      customerId: z.coerce.number().optional(),
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
    const response = await iracing.api.data.member.awards(query);
    return response.data;
  }
);

export const awardInstances = createEndpoint(
  "/data/member/award_instances",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      customerId: z.coerce.number().optional(),
      awardId: z.number(),
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
    const response = await iracing.api.data.member.awardInstances(query);
    return response.data;
  }
);

// export const chartData = createEndpoint(
//   "/data/member/chart_data",
//   {
//     method: "GET",
//     requireHeaders: true,
//     query: z.object({
//       customerId: z.coerce.number().optional(),
//       categoryId: CategoryIdValueSchema,
//       chartType: ChartTypeValueSchema,
//     }),
//   },
//   async ({ context: { iracing }, query }) => {
//     return iracing.api.data.member.chartData(query);
//   }
// );

// export const getMember = createEndpoint(
//   "/data/member/get",
//   { method: "GET" },
//   async ({ context: { iracing }, query }) => {
//     return iracing.api.data.member.get(query);
//   }
// );

export const info = createEndpoint(
  "/data/member/info",
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
    const response = await iracing.api.data.member.info();
    return response.data;
  }
);

export const participationCredits = createEndpoint(
  "/data/member/participation_credits",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.member.participationCredits();
    return response.data;
  }
);

export const profile = createEndpoint(
  "/data/member/profile",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      customerId: z.coerce.number().optional(),
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
    const response = await iracing.api.data.member.profile(query);
    return response.data;
  }
);
