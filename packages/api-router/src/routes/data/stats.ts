import {
  IRacingStatsMemberBestsParametersSchema,
  IRacingStatsMemberCareerParametersSchema,
  IRacingStatsMemberDivisionParametersSchema,
  IRacingStatsMemberRecapParametersSchema,
  IRacingStatsMemberRecentRacesParametersSchema,
  IRacingStatsMemberSummaryParametersSchema,
  IRacingStatsMemberYearlyParametersSchema,
  IRacingStatsSeasonDriverStandingsParametersSchema,
  IRacingStatsSeasonQualifyResultsParametersSchema,
  IRacingStatsSeasonSupersessionStandingsParametersSchema,
  IRacingStatsSeasonTeamStandingsParametersSchema,
  IRacingStatsSeasonTTResultsParametersSchema,
  IRacingStatsSeasonTTStandingsParametersSchema,
  IRacingStatsWorldRecordsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const memberBests = createEndpoint(
  "/data/stats/member_bests",
  {
    method: "GET",
    query: IRacingStatsMemberBestsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberBests(query);
    return response.data;
  }
);

export const memberCareer = createEndpoint(
  "/data/stats/member_career",
  {
    method: "GET",
    query: IRacingStatsMemberCareerParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberCareer(query);
    return response.data;
  }
);

export const memberDivision = createEndpoint(
  "/data/stats/member_division",
  {
    method: "GET",
    query: IRacingStatsMemberDivisionParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberDivision(query);
    return response.data;
  }
);

export const memberRecap = createEndpoint(
  "/data/stats/member_recap",
  {
    method: "GET",
    query: IRacingStatsMemberRecapParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberRecap(query);
    return response.data;
  }
);

export const memberRecentRaces = createEndpoint(
  "/data/stats/member_recent_races",
  {
    method: "GET",
    query: IRacingStatsMemberRecentRacesParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberRecentRaces(query);
    return response.data;
  }
);

export const memberSummary = createEndpoint(
  "/data/stats/member_summary",
  {
    method: "GET",
    query: IRacingStatsMemberSummaryParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberSummary(query);
    return response.data;
  }
);

export const memberYearly = createEndpoint(
  "/data/stats/member_yearly",
  {
    method: "GET",
    query: IRacingStatsMemberYearlyParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsMemberYearly(query);
    return response.data;
  }
);

export const seasonDriverStandings = createEndpoint(
  "/data/stats/season_driver_standings",
  {
    method: "GET",
    query: IRacingStatsSeasonDriverStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsSeasonDriverStandings(query);
    return response.data;
  }
);

export const seasonSupersessionStandings = createEndpoint(
  "/data/stats/season_supersession_standings",
  {
    method: "GET",
    query: IRacingStatsSeasonSupersessionStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.stats.getStatsSeasonSupersessionStandings(query);
    return response.data;
  }
);

export const seasonTeamStandings = createEndpoint(
  "/data/stats/season_team_standings",
  {
    method: "GET",
    query: IRacingStatsSeasonTeamStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsSeasonTeamStandings(query);
    return response.data;
  }
);

export const seasonTimeTrialStandings = createEndpoint(
  "/data/stats/season_time_trial_standings",
  {
    method: "GET",
    query: IRacingStatsSeasonTTStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.stats.getStatsSeasonTimeTrialStandings(query);
    return response.data;
  }
);

export const seasonTimeTrialResults = createEndpoint(
  "/data/stats/season_time_trial_results",
  {
    method: "GET",
    query: IRacingStatsSeasonTTResultsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsSeasonTimeTrialResults(query);
    return response.data;
  }
);

export const seasonQualifyResults = createEndpoint(
  "/data/stats/season_qualify_results",
  {
    method: "GET",
    query: IRacingStatsSeasonQualifyResultsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsSeasonQualifyResults(query);
    return response.data;
  }
);

export const worldRecords = createEndpoint(
  "/data/stats/world_records",
  {
    method: "GET",
    query: IRacingStatsWorldRecordsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.stats.getStatsWorldRecords(query);
    return response.data;
  }
);
