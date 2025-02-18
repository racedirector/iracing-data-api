import { AxiosInstance } from "axios";
import { IRacingAPIResponse } from "../../types";

export class CarAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  assets() {
    return this._client.get<IRacingAPIResponse>("/data/car/assets");
  }

  get() {
    return this._client.get<IRacingAPIResponse>("/data/car/get");
  }
}

export default CarAPI;
