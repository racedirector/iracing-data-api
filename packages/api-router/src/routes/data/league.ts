import { createEndpoint } from "../utils";
import { z } from "zod";

export const directory = createEndpoint(
  "/data/league/directory",
  {
    method: "GET",
    query: z.object({
      search: z.string().optional(),
      tag: z.string().optional(),
      restrictToMember: z.boolean().optional(),
      restrictToRecruiting: z.boolean().optional(),
      restrictToFriends: z.boolean().optional(),
      restrictToWatched: z.boolean().optional(),
      minimumRosterCount: z.number().optional(),
      maximumRosterCount: z.number().optional(),
      lowerbound: z.number().optional(),
      upperbound: z.number().optional(),
      sort: z
        .union([
          z.literal("relevance"),
          z.literal("leaguename"),
          z.literal("displayname"),
        ])
        .optional(),
      order: z.union([z.literal("asc"), z.literal("desc")]),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.directory(query);
  }
);

export const customerLeagueSessions = createEndpoint(
  "/data/league/cust_league_sessions",
  {
    method: "GET",
    query: z.object({
      mine: z.boolean().optional(),
      packageId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.customerLeagueSessions(query);
  }
);

export const getLeague = createEndpoint(
  "/data/league/get",
  {
    method: "GET",
    query: z.object({
      leagueId: z.number(),
      includeLicenses: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.get(query);
  }
);

export const getPointsSystem = createEndpoint(
  "/data/league/get_points_systems",
  {
    method: "GET",
    query: z.object({
      leagueId: z.number(),
      seasonId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.getPointsSystems(query);
  }
);

export const leagueMembership = createEndpoint(
  "/data/league/membership",
  {
    method: "GET",
    query: z.object({
      customerId: z.number().optional(),
      includeLeague: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.membership(query);
  }
);

export const leagueRoster = createEndpoint(
  "/data/league/roster",
  {
    method: "GET",
    query: z.object({
      leagueId: z.number(),
      includeLicenses: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.roster(query);
  }
);

export const leagueSeasons = createEndpoint(
  "/data/league/seasons",
  {
    method: "GET",
    query: z.object({
      leagueId: z.number(),
      retired: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.seasons(query);
  }
);

export const seasonStandings = createEndpoint(
  "/data/league/season_standings",
  {
    method: "GET",
    query: z.object({
      leagueId: z.number(),
      seasonId: z.number(),
      carClassId: z.number().optional(),
      carId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.seasonStandings(query);
  }
);

export const seasonSessions = createEndpoint(
  "/data/league/season_sessions",
  {
    method: "GET",
    query: z.object({
      leagueId: z.number(),
      seasonId: z.number(),
      resultsOnly: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.league.seasonSessions(query);
  }
);
