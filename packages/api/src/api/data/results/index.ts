import {
  CategoryIdValue,
  EventTypeValue,
  NetworkClientProvider,
} from "../../../types";

export class ResultsAPI extends NetworkClientProvider {
  get({
    subsessionId,
    includeLicenses,
  }: {
    subsessionId: number;
    includeLicenses?: boolean;
  }) {
    return this.client.get("/data/results/get", {
      params: {
        subsession_id: subsessionId,
        include_licenses: includeLicenses,
      },
    });
  }

  eventLog({
    subsessionId,
    simsessionNumber,
  }: {
    subsessionId: number;
    simsessionNumber: number;
  }) {
    return this.client.get("/data/results/event_log", {
      params: {
        subsession_id: subsessionId,
        simsession_number: simsessionNumber,
      },
    });
  }

  lapChartData({
    subsessionId,
    simsessionNumber,
  }: {
    subsessionId: number;
    simsessionNumber: number;
  }) {
    return this.client.get("/data/results/lap_chart_data", {
      params: {
        subsession_id: subsessionId,
        simsession_number: simsessionNumber,
      },
    });
  }

  lapData({
    subsessionId,
    simsessionNumber,
    customerId,
    teamId,
  }: {
    subsessionId: number;
    simsessionNumber: number;
    customerId?: number;
    teamId?: number;
  }) {
    return this.client.get("/data/results/lap_data", {
      params: {
        subsession_id: subsessionId,
        simsession_number: simsessionNumber,
        cust_id: customerId,
        team_id: teamId,
      },
    });
  }

  searchHosted({
    startRangeBegin,
    startRangeEnd,
    finishRangeBegin,
    finishRangeEnd,
    customerId,
    teamId,
    hostCustomerId,
    sessionName,
    leagueId,
    leagueSeasonId,
    carId,
    trackId,
    categoryIds,
  }: {
    startRangeBegin?: Date;
    startRangeEnd?: Date;
    finishRangeBegin?: Date;
    finishRangeEnd?: Date;
    customerId?: number;
    teamId?: number;
    hostCustomerId?: number;
    sessionName?: string;
    leagueId?: number;
    leagueSeasonId?: number;
    carId?: number;
    trackId?: number;
    categoryIds?: CategoryIdValue[];
  }) {
    return this.client.get("/data/results/search_hosted", {
      params: {
        start_range_begin: startRangeBegin?.toUTCString(),
        start_range_end: startRangeEnd?.toUTCString(),
        finish_range_begin: finishRangeBegin?.toUTCString(),
        finish_range_end: finishRangeEnd?.toUTCString(),
        cust_id: customerId,
        team_id: teamId,
        host_cust_id: hostCustomerId,
        session_name: sessionName,
        league_id: leagueId,
        league_season_id: leagueSeasonId,
        car_id: carId,
        track_id: trackId,
        category_ids: categoryIds,
      },
    });
  }

  searchSeries({
    seasonYear,
    seasonQuarter,
    startRangeBegin,
    startRangeEnd,
    finishRangeBegin,
    finishRangeEnd,
    customerId,
    teamId,
    seriesId,
    raceWeekNumber,
    officialOnly,
    eventTypes,
    categoryIds,
  }: {
    seasonYear?: number;
    seasonQuarter?: number;
    startRangeBegin?: Date;
    startRangeEnd?: Date;
    finishRangeBegin?: Date;
    finishRangeEnd?: Date;
    customerId?: number;
    teamId?: number;
    seriesId?: number;
    raceWeekNumber?: number;
    officialOnly?: boolean;
    eventTypes?: EventTypeValue[];
    categoryIds?: CategoryIdValue[];
  }) {
    return this.client.get("/data/results/search_series", {
      params: {
        season_year: seasonYear,
        season_quarter: seasonQuarter,
        start_range_begin: startRangeBegin?.toUTCString(),
        start_range_end: startRangeEnd?.toUTCString(),
        finish_range_begin: finishRangeBegin?.toUTCString(),
        finish_range_end: finishRangeEnd?.toUTCString(),
        cust_id: customerId,
        team_id: teamId,
        series_id: seriesId,
        race_week_num: raceWeekNumber,
        official_only: officialOnly,
        event_types: eventTypes,
        category_ids: categoryIds,
      },
    });
  }

  seasonResults({
    seasonId,
    eventType,
    raceWeekNumber,
  }: {
    seasonId: number;
    eventType?: EventTypeValue;
    raceWeekNumber: number;
  }) {
    return this.client.get("/data/results/season_results", {
      params: {
        season_id: seasonId,
        event_type: eventType,
        race_week_num: raceWeekNumber,
      },
    });
  }
}

export default ResultsAPI;
