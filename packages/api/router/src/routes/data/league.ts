import {
  LeagueCustomerSessionsParametersSchema,
  LeagueDirectoryParametersSchema,
  LeagueGetParametersSchema,
  LeagueGetPointsSystemsParametersSchema,
  LeagueMembershipParametersSchema,
  LeagueRosterParametersSchema,
  LeagueSeasonSessionsParametersSchema,
  LeagueSeasonsParametersSchema,
  LeagueSeasonStandingsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const directory = createEndpoint(
  "/data/league/directory",
  {
    method: "GET",
    query: LeagueDirectoryParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueDirectory(query);
  },
);

export const customerLeagueSessions = createEndpoint(
  "/data/league/cust_league_sessions",
  {
    method: "GET",
    query: LeagueCustomerSessionsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueCustomerLeagueSessions(query);
  },
);

export const getLeague = createEndpoint(
  "/data/league/get",
  {
    method: "GET",
    query: LeagueGetParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeague(query);
  },
);

export const getPointsSystems = createEndpoint(
  "/data/league/get_points_systems",
  {
    method: "GET",
    query: LeagueGetPointsSystemsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeaguePointsSystems(query);
  },
);

export const leagueMembership = createEndpoint(
  "/data/league/membership",
  {
    method: "GET",
    query: LeagueMembershipParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueMembership(query);
  },
);

export const leagueRoster = createEndpoint(
  "/data/league/roster",
  {
    method: "GET",
    query: LeagueRosterParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueRoster(query);
  },
);

export const leagueSeasons = createEndpoint(
  "/data/league/seasons",
  {
    method: "GET",
    query: LeagueSeasonsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueSeasons(query);
  },
);

export const seasonStandings = createEndpoint(
  "/data/league/season_standings",
  {
    method: "GET",
    query: LeagueSeasonStandingsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueSeasonStandings(query);
  },
);

export const seasonSessions = createEndpoint(
  "/data/league/season_sessions",
  {
    method: "GET",
    query: LeagueSeasonSessionsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.league.getLeagueSeasonSessions(query);
  },
);
