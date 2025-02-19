import { NetworkClientProvider, IRacingAPIResponse } from "../../../types";

export class CarClassAPI extends NetworkClientProvider {
  get() {
    return this.client.get<IRacingAPIResponse>("/data/carclass/get");
  }
}

export default CarClassAPI;
