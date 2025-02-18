import { AxiosInstance } from "axios";
import { IRacingAPIResponse } from "../../types";

export class CarClassAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  get() {
    return this._client.get<IRacingAPIResponse>("/data/carclass/get");
  }
}

export default CarClassAPI;
