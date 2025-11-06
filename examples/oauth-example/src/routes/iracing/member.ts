import { createEndpoint } from "./utils";
import { z } from "zod";

export const awards = createEndpoint(
  "/data/member/awards",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      customerId: z.coerce.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.member.awards(query);
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
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.member.awardInstances(query);
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
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.member.info();
  }
);

export const participationCredits = createEndpoint(
  "/data/member/info",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.member.participationCredits();
  }
);

export const profile = createEndpoint(
  "/data/member/profile",
  {
    method: "GET",
    query: z.object({
      customerId: z.coerce.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.member.profile(query);
  }
);
