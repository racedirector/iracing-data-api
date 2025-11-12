import { createEndpoint } from "../utils";
import {
  IRacingMemberAwardInstancesParametersSchema,
  IRacingMemberAwardsParametersSchema,
  IRacingMemberChartDataParametersSchema,
  IRacingMemberGetParametersSchema,
  IRacingMemberProfileParametersSchema,
} from "@iracing-data/api-schema";

export const awards = createEndpoint(
  "/data/member/awards",
  {
    method: "GET",
    requireHeaders: true,
    query: IRacingMemberAwardsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.member.getMemberAwards(query);
    return response.data;
  }
);

export const awardInstances = createEndpoint(
  "/data/member/award_instances",
  {
    method: "GET",
    requireHeaders: true,
    query: IRacingMemberAwardInstancesParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.member.getMemberAwardInstances(query);
    return response.data;
  }
);

export const chartData = createEndpoint(
  "/data/member/chart_data",
  {
    method: "GET",
    query: IRacingMemberChartDataParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.member.getMemberChartData(query);
    return response.data;
  }
);

export const getMember = createEndpoint(
  "/data/member/get",
  {
    method: "GET",
    query: IRacingMemberGetParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.member.getMember(query);
    return response.data;
  }
);

export const info = createEndpoint(
  "/data/member/info",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.member.getMemberInfo();
    return response.data;
  }
);

export const participationCredits = createEndpoint(
  "/data/member/participation_credits",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.member.getMemberParticipationCredits();
    return response.data;
  }
);

export const profile = createEndpoint(
  "/data/member/profile",
  {
    method: "GET",
    query: IRacingMemberProfileParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.member.getMemberProfile(query);
    return response.data;
  }
);
