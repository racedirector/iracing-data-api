import { IRacingAPIResponse, NetworkClientProvider } from "../../types";

export class LeagueAPI extends NetworkClientProvider {
  directory({
    search,
    tag,
    restrictToMember,
    restrictToRecruiting,
    restrictToFriends,
    restrictToWatched,
    minimumRosterCount,
    maximumRosterCount,
    lowerbound,
    upperbound,
    sort,
    order,
  }: {
    search?: string;
    tag?: string;
    restrictToMember?: boolean;
    restrictToRecruiting?: boolean;
    restrictToFriends?: boolean;
    restrictToWatched?: boolean;
    minimumRosterCount?: number;
    maximumRosterCount?: number;
    lowerbound?: number;
    upperbound?: number;
    sort?: "relevance" | "leaguename" | "displayname" | "rostercount";
    order?: "asc" | "desc";
  } = {}) {
    return this.client.get<IRacingAPIResponse>("/data/league/directory", {
      params: {
        search,
        tag,
        restrict_to_member: restrictToMember,
        restrict_to_recruiting: restrictToRecruiting,
        restrict_to_friends: restrictToFriends,
        restrict_to_watched: restrictToWatched,
        minimum_roster_count: minimumRosterCount,
        maximum_roster_count: maximumRosterCount,
        lowerbound,
        upperbound,
        sort,
        order,
      },
    });
  }

  customerLeagueSessions({
    mine,
    packageId,
  }: {
    mine?: boolean;
    packageId?: number;
  } = {}) {
    return this.client.get<IRacingAPIResponse>(
      "/data/league/cust_league_sessions",
      {
        params: { mine, package_id: packageId },
      }
    );
  }

  get({
    leagueId,
    includeLicenses,
  }: {
    leagueId: number;
    includeLicenses?: boolean;
  }) {
    return this.client.get<IRacingAPIResponse>("/data/league/get", {
      params: { league_id: leagueId, include_licenses: includeLicenses },
    });
  }

  getPointsSystems({
    leagueId,
    seasonId,
  }: {
    leagueId: number;
    seasonId?: number;
  }) {
    return this.client.get<IRacingAPIResponse>(
      "/data/league/get_points_systems",
      {
        params: { league_id: leagueId, season_id: seasonId },
      }
    );
  }

  membership({
    customerId,
    includeLeague,
  }: { customerId?: number; includeLeague?: boolean } = {}) {
    return this.client.get<IRacingAPIResponse>("/data/league/membership", {
      params: { cust_id: customerId, include_league: includeLeague },
    });
  }

  roster({
    leagueId,
    includeLicenses,
  }: {
    leagueId: number;
    includeLicenses?: boolean;
  }) {
    return this.client.get<IRacingAPIResponse>("/data/league/roster", {
      params: { league_id: leagueId, include_licenses: includeLicenses },
    });
  }

  seasons({ leagueId, retired }: { leagueId: number; retired?: boolean }) {
    return this.client.get<IRacingAPIResponse>("/data/league/seasons", {
      params: { league_id: leagueId, retired: retired },
    });
  }

  seasonStandings({
    leagueId,
    seasonId,
    carClassId,
    carId,
  }: {
    leagueId: number;
    seasonId: number;
    carClassId?: number;
    carId?: number;
  }) {
    return this.client.get<IRacingAPIResponse>(
      "/data/league/season_standings",
      {
        params: {
          league_id: leagueId,
          season_id: seasonId,
          car_class_id: carClassId,
          car_id: carId,
        },
      }
    );
  }

  seasonSessions({
    leagueId,
    seasonId,
    resultsOnly,
  }: {
    leagueId: number;
    seasonId: number;
    resultsOnly?: boolean;
  }) {
    return this.client.get<IRacingAPIResponse>("/data/league/season_sessions", {
      params: {
        league_id: leagueId,
        season_id: seasonId,
        results_only: resultsOnly,
      },
    });
  }
}

export default LeagueAPI;
