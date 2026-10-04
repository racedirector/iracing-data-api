import {
  StatsMemberBestsParametersSchema,
  StatsMemberCareerParametersSchema,
  StatsMemberDivisionParametersSchema,
  StatsMemberRecapParametersSchema,
  StatsMemberRecentRacesParametersSchema,
  StatsMemberSummaryParametersSchema,
  StatsMemberYearlyParametersSchema,
  StatsSeasonDriverStandingsParametersSchema,
  StatsSeasonQualifyResultsParametersSchema,
  StatsSeasonSupersessionStandingsParametersSchema,
  StatsSeasonTeamStandingsParametersSchema,
  StatsSeasonTTResultsParametersSchema,
  StatsSeasonTTStandingsParametersSchema,
  StatsWorldRecordsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const memberBests = createEndpoint(
  "/data/stats/member_bests",
  {
    method: "GET",
    query: StatsMemberBestsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberBests(query);
  },
);

export const memberCareer = createEndpoint(
  "/data/stats/member_career",
  {
    method: "GET",
    query: StatsMemberCareerParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberCareer(query);
  },
);

export const memberDivision = createEndpoint(
  "/data/stats/member_division",
  {
    method: "GET",
    query: StatsMemberDivisionParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberDivision(query);
  },
);

export const memberRecap = createEndpoint(
  "/data/stats/member_recap",
  {
    method: "GET",
    query: StatsMemberRecapParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberRecap(query);
  },
);

export const memberRecentRaces = createEndpoint(
  "/data/stats/member_recent_races",
  {
    method: "GET",
    query: StatsMemberRecentRacesParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberRecentRaces(query);
  },
);

export const memberSummary = createEndpoint(
  "/data/stats/member_summary",
  {
    method: "GET",
    query: StatsMemberSummaryParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberSummary(query);
  },
);

export const memberYearly = createEndpoint(
  "/data/stats/member_yearly",
  {
    method: "GET",
    query: StatsMemberYearlyParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsMemberYearly(query);
  },
);

export const seasonDriverStandings = createEndpoint(
  "/data/stats/season_driver_standings",
  {
    method: "GET",
    query: StatsSeasonDriverStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsSeasonDriverStandings(query);
  },
);

export const seasonSupersessionStandings = createEndpoint(
  "/data/stats/season_supersession_standings",
  {
    method: "GET",
    query: StatsSeasonSupersessionStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsSeasonSupersessionStandings(query);
  },
);

export const seasonTeamStandings = createEndpoint(
  "/data/stats/season_team_standings",
  {
    method: "GET",
    query: StatsSeasonTeamStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsSeasonTeamStandings(query);
  },
);

export const seasonTimeTrialStandings = createEndpoint(
  "/data/stats/season_time_trial_standings",
  {
    method: "GET",
    query: StatsSeasonTTStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsSeasonTimeTrialStandings(query);
  },
);

export const seasonTimeTrialResults = createEndpoint(
  "/data/stats/season_time_trial_results",
  {
    method: "GET",
    query: StatsSeasonTTResultsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsSeasonTimeTrialResults(query);
  },
);

export const seasonQualifyResults = createEndpoint(
  "/data/stats/season_qualify_results",
  {
    method: "GET",
    query: StatsSeasonQualifyResultsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsSeasonQualifyResults(query);
  },
);

export const worldRecords = createEndpoint(
  "/data/stats/world_records",
  {
    method: "GET",
    query: StatsWorldRecordsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.stats.getStatsWorldRecords(query);
  },
);
