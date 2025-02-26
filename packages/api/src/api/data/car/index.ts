import { NetworkClientProvider, IRacingAPIResponse } from "../../types";

export class CarAPI extends NetworkClientProvider {
  /**
   * Get car assets
   * Image paths are relative to https://images-static.iracing.com/
   */
  assets() {
    return this.client.get<IRacingAPIResponse>("/data/car/assets");
  }

  get() {
    return this.client.get<IRacingAPIResponse>("/data/car/get");
  }
}

export default CarAPI;
