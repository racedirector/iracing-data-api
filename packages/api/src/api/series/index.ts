import { AxiosInstance } from "axios";
import { IRacingAPIResponse } from "../../types";

export class SeriesAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  /**
   * Note: image paths are relative to https://images-static.iracing.com/
   */
  assets() {
    return this._client.get<IRacingAPIResponse>("/data/series/assets");
  }

  get() {
    return this._client.get<IRacingAPIResponse>("/data/series/get");
  }

  pastSeasons({ seriesId }: { seriesId: number }) {
    return this._client.get<IRacingAPIResponse>("/data/series/past_seasons", {
      params: { series_id: seriesId },
    });
  }

  seasons({ includeSeries }: { includeSeries?: boolean }) {
    return this._client.get<IRacingAPIResponse>("/data/series/seasons", {
      params: { include_series: includeSeries },
    });
  }

  statsSeries() {
    return this._client.get<IRacingAPIResponse>("/data/series/stats_series");
  }
}

export default SeriesAPI;
