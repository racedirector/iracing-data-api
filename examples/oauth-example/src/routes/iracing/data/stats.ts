import { DivisionSchema } from "../schema";
import { createEndpoint } from "../utils";
import { z } from "zod";

export const memberBests = createEndpoint(
  "/data/stats/member_bests",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
      carId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberBests(query);
    return response.data;
  }
);

export const memberCareer = createEndpoint(
  "/data/stats/member_career",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberCareer(query);
    return response.data;
  }
);

export const memberDivision = createEndpoint(
  "/data/stats/member_division",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      eventType: z.union([z.literal(4), z.literal(5)]),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberDivision(query);
    return response.data;
  }
);

export const memberRecap = createEndpoint(
  "/data/stats/member_recap",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
      year: z.number().optional(),
      season: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberRecap(query);
    return response.data;
  }
);

export const memberRecentRaces = createEndpoint(
  "/data/stats/member_recent_races",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberRecentRaces(query);
    return response.data;
  }
);

export const memberSummary = createEndpoint(
  "/data/stats/member_summary",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberSummary(query);
    return response.data;
  }
);

export const memberYearly = createEndpoint(
  "/data/stats/member_yearly",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.memberYearly(query);
    return response.data;
  }
);

export const seasonDriverStandings = createEndpoint(
  "/data/stats/season_driver_standings",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      carClassId: z.number(),
      raceWeekNumber: z.number().optional(),
      division: DivisionSchema.optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.seasonDriverStandings(query);
    return response.data;
  }
);

export const seasonSupersessionStandings = createEndpoint(
  "/data/stats/season_supersession_standings",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      carClassId: z.number(),
      raceWeekNumber: z.number().optional(),
      division: DivisionSchema.optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.api.data.stats.seasonSupersessionStandings(query);
    return response.data;
  }
);

export const seasonTeamStandings = createEndpoint(
  "/data/stats/season_team_standings",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      carClassId: z.number(),
      raceWeekNumber: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.seasonTeamStandings(query);
    return response.data;
  }
);

export const seasonTimeTrialStandings = createEndpoint(
  "/data/stats/season_time_trial_standings",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      carClassId: z.number(),
      raceWeekNumber: z.number().optional(),
      division: DivisionSchema.optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.api.data.stats.seasonTimeTrialStandings(query);
    return response.data;
  }
);

export const seasonTimeTrialResults = createEndpoint(
  "/data/stats/season_time_trial_results",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      carClassId: z.number(),
      raceWeekNumber: z.number(),
      division: DivisionSchema.optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.seasonTimeTrialResults(query);
    return response.data;
  }
);

export const seasonQualifyResults = createEndpoint(
  "/data/stats/season_qualify_results",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
      carClassId: z.number(),
      raceWeekNumber: z.number(),
      division: DivisionSchema.optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.seasonQualifyResults(query);
    return response.data;
  }
);

export const worldRecords = createEndpoint(
  "/data/stats/world_records",
  {
    method: "GET",
    query: z.object({
      carId: z.number(),
      trackId: z.number(),
      seasonYear: z.number().optional(),
      seasonQuarter: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.stats.worldRecords(query);
    return response.data;
  }
);
