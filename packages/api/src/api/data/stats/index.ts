import { Division, NetworkClientProvider } from "../../types";

export class StatsAPI extends NetworkClientProvider {
  memberBests({
    customerId,
    carId,
  }: { customerId?: number; carId?: number } = {}) {
    return this.client.get("/data/stats/member_bests", {
      params: {
        cust_id: customerId,
        car_id: carId,
      },
    });
  }

  memberCareer({ customerId }: { customerId?: number } = {}) {
    return this.client.get("/data/stats/member_career", {
      params: {
        cust_id: customerId,
      },
    });
  }

  memberDivision({
    seasonId,
    eventType,
  }: {
    seasonId: number;
    eventType: 4 | 5;
  }) {
    return this.client.get("/data/stats/member_division", {
      params: {
        season_id: seasonId,
        event_type: eventType,
      },
    });
  }

  memberRecap({
    customerId,
    year,
    season,
  }: {
    customerId?: number;
    year?: number;
    season?: 1 | 2 | 3 | 4;
  }) {
    return this.client.get("/data/stats/member_recap", {
      params: {
        cust_id: customerId,
        year,
        season,
      },
    });
  }

  memberRecentRaces({ customerId }: { customerId?: number } = {}) {
    return this.client.get("/data/stats/member_recent_races", {
      params: {
        cust_id: customerId,
      },
    });
  }

  memberSummary({ customerId }: { customerId?: number } = {}) {
    return this.client.get("/data/stats/member_summary", {
      params: {
        cust_id: customerId,
      },
    });
  }

  memberYearly({ customerId }: { customerId?: number } = {}) {
    return this.client.get("/data/stats/member_yearly", {
      params: {
        cust_id: customerId,
      },
    });
  }

  seasonDriverStandings({
    seasonId,
    carClassId,
    raceWeekNumber,
    division,
  }: {
    seasonId: number;
    carClassId: number;
    raceWeekNumber?: number;
    division?: Division;
  }) {
    return this.client.get("/data/stats/season_driver_standings", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        division,
        race_week_num: raceWeekNumber,
      },
    });
  }

  seasonSupersessionStandings({
    seasonId,
    carClassId,
    raceWeekNumber,
    division,
  }: {
    seasonId: number;
    carClassId: number;
    raceWeekNumber?: number;
    division?: Division;
  }) {
    return this.client.get("/data/stats/season_supersession_standings", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        division,
        race_week_num: raceWeekNumber,
      },
    });
  }

  seasonTeamStandings({
    seasonId,
    carClassId,
    raceWeekNumber,
  }: {
    seasonId: number;
    carClassId: number;
    raceWeekNumber?: number;
  }) {
    return this.client.get("/data/stats/season_team_standings", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        race_week_num: raceWeekNumber,
      },
    });
  }

  seasonTimeTrialStandings({
    seasonId,
    carClassId,
    raceWeekNumber,
    division,
  }: {
    seasonId: number;
    carClassId: number;
    raceWeekNumber?: number;
    division?: Division;
  }) {
    return this.client.get("/data/stats/season_time_trial_standings", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        division,
        race_week_num: raceWeekNumber,
      },
    });
  }

  seasonTimeTrialResults({
    seasonId,
    carClassId,
    raceWeekNumber,
    division,
  }: {
    seasonId: number;
    carClassId: number;
    raceWeekNumber: number;
    division?: Division;
  }) {
    return this.client.get("/data/stats/season_time_trial_results", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        race_week_num: raceWeekNumber,
        division,
      },
    });
  }

  seasonQualifyResults({
    seasonId,
    carClassId,
    raceWeekNumber,
    division,
  }: {
    seasonId: number;
    carClassId: number;
    raceWeekNumber: number;
    division?: Division;
  }) {
    return this.client.get("/data/stats/season_qualify_results", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        race_week_num: raceWeekNumber,
        division,
      },
    });
  }

  worldRecords({
    carId,
    trackId,
    seasonYear,
    seasonQuarter,
  }: {
    carId: number;
    trackId: number;
    seasonYear?: number;
    seasonQuarter?: number;
  }) {
    return this.client.get("/data/stats/world_records", {
      params: {
        carId,
        trackId,
        seasonYear,
        seasonQuarter,
      },
    });
  }
}

export default StatsAPI;
