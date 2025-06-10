import { IRacingAPIResponse, NetworkClientProvider } from "../../types";

export class SeriesAPI extends NetworkClientProvider {
  /**
   * Note: image paths are relative to https://images-static.iracing.com/
   */
  assets() {
    return this.client.get<IRacingAPIResponse>("/data/series/assets");
  }

  get() {
    return this.client.get<IRacingAPIResponse>("/data/series/get");
  }

  pastSeasons({ seriesId }: { seriesId: number }) {
    return this.client.get<IRacingAPIResponse>("/data/series/past_seasons", {
      params: { series_id: seriesId },
    });
  }

  seasons({
    includeSeries,
    seasonYear,
    seasonQuarter,
  }: {
    includeSeries?: boolean;
    seasonYear?: number;
    seasonQuarter?: number;
  } = {}) {
    return this.client.get<IRacingAPIResponse>("/data/series/seasons", {
      params: {
        include_series: includeSeries,
        season_year: seasonYear,
        season_quarter: seasonQuarter,
      },
    });
  }

  seasonList({
    includeSeries,
    seasonYear,
    seasonQuarter,
  }: {
    includeSeries?: boolean;
    seasonYear?: number;
    seasonQuarter?: number;
  } = {}) {
    return this.client.get<IRacingAPIResponse>("/data/series/season_list", {
      params: {
        include_series: includeSeries,
        season_year: seasonYear,
        season_quarter: seasonQuarter,
      },
    });
  }

  seasonSchedule({ seasonId }: { seasonId: number }) {
    return this.client.get<IRacingAPIResponse>("/data/series/season_schedule", {
      params: { season_id: seasonId },
    });
  }

  statsSeries() {
    return this.client.get<IRacingAPIResponse>("/data/series/stats_series");
  }
}

export default SeriesAPI;
