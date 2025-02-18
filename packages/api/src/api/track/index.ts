import { AxiosInstance } from "axios";
import { IRacingAPIResponse } from "../../types";

export class TrackAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  /**
   * Get track assets
   * Image paths are relative to https://images-static.iracing.com/
   */
  assets() {
    return this._client.get<IRacingAPIResponse>("/data/track/assets");
  }

  get() {
    return this._client.get<IRacingAPIResponse>("/data/track/get");
  }
}

export default TrackAPI;
