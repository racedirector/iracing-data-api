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

  seasons({ includeSeries }: { includeSeries?: boolean }) {
    return this.client.get<IRacingAPIResponse>("/data/series/seasons", {
      params: { include_series: includeSeries },
    });
  }

  statsSeries() {
    return this.client.get<IRacingAPIResponse>("/data/series/stats_series");
  }
}

export default SeriesAPI;
