import { NetworkClientProvider, IRacingAPIResponse } from "../../../types";

export class CarAPI extends NetworkClientProvider {
  assets() {
    return this.client.get<IRacingAPIResponse>("/data/car/assets");
  }

  get() {
    return this.client.get<IRacingAPIResponse>("/data/car/get");
  }
}

export default CarAPI;
