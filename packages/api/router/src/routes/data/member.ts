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
    return await iracing.member.getMemberAwards(query);
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
    return await iracing.member.getMemberAwardInstances(query);
  }
);

export const chartData = createEndpoint(
  "/data/member/chart_data",
  {
    method: "GET",
    query: IRacingMemberChartDataParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.member.getMemberChartData(query);
  }
);

export const getMember = createEndpoint(
  "/data/member/get",
  {
    method: "GET",
    query: IRacingMemberGetParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.member.getMember(query);
  }
);

export const info = createEndpoint(
  "/data/member/info",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.member.getMemberInfo();
  }
);

export const participationCredits = createEndpoint(
  "/data/member/participation_credits",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.member.getMemberParticipationCredits();
  }
);

export const profile = createEndpoint(
  "/data/member/profile",
  {
    method: "GET",
    query: IRacingMemberProfileParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.member.getMemberProfile(query);
  }
);
