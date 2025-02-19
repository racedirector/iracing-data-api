import { IRacingAPIResponse, NetworkClientProvider } from "../../types";

export class TrackAPI extends NetworkClientProvider {
  /**
   * Get track assets
   * Image paths are relative to https://images-static.iracing.com/
   */
  assets() {
    return this.client.get<IRacingAPIResponse>("/data/track/assets");
  }

  get() {
    return this.client.get<IRacingAPIResponse>("/data/track/get");
  }
}

export default TrackAPI;
