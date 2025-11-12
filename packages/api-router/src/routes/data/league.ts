import {
  IRacingLeagueCustomerSessionsParametersSchema,
  IRacingLeagueDirectoryParametersSchema,
  IRacingLeagueGetParametersSchema,
  IRacingLeagueGetPointsSystemsParametersSchema,
  IRacingLeagueMembershipParametersSchema,
  IRacingLeagueRosterParametersSchema,
  IRacingLeagueSeasonSessionsParametersSchema,
  IRacingLeagueSeasonsParametersSchema,
  IRacingLeagueSeasonStandingsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const directory = createEndpoint(
  "/data/league/directory",
  {
    method: "GET",
    query: IRacingLeagueDirectoryParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeagueDirectory(query);
    return response.data;
  }
);

export const customerLeagueSessions = createEndpoint(
  "/data/league/cust_league_sessions",
  {
    method: "GET",
    query: IRacingLeagueCustomerSessionsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.league.getLeagueCustomerLeagueSessions(query);
    return response.data;
  }
);

export const getLeague = createEndpoint(
  "/data/league/get",
  {
    method: "GET",
    query: IRacingLeagueGetParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeague(query);
    return response.data;
  }
);

export const getPointsSystems = createEndpoint(
  "/data/league/get_points_systems",
  {
    method: "GET",
    query: IRacingLeagueGetPointsSystemsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeaguePointsSystems(query);
    return response.data;
  }
);

export const leagueMembership = createEndpoint(
  "/data/league/membership",
  {
    method: "GET",
    query: IRacingLeagueMembershipParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeagueMembership(query);
    return response.data;
  }
);

export const leagueRoster = createEndpoint(
  "/data/league/roster",
  {
    method: "GET",
    query: IRacingLeagueRosterParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeagueRoster(query);
    return response.data;
  }
);

export const leagueSeasons = createEndpoint(
  "/data/league/seasons",
  {
    method: "GET",
    query: IRacingLeagueSeasonsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeagueSeasons(query);
    return response.data;
  }
);

export const seasonStandings = createEndpoint(
  "/data/league/season_standings",
  {
    method: "GET",
    query: IRacingLeagueSeasonStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeagueSeasonStandings(query);
    return response.data;
  }
);

export const seasonSessions = createEndpoint(
  "/data/league/season_sessions",
  {
    method: "GET",
    query: IRacingLeagueSeasonSessionsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.league.getLeagueSeasonSessions(query);
    return response.data;
  }
);
