import { AxiosInstance } from "axios";
import { IRacingAPIResponse } from "../../types";

export class ConstantsAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  categories() {
    return this._client.get<IRacingAPIResponse>("/data/constants/categories");
  }

  divisions() {
    return this._client.get<IRacingAPIResponse>("/data/constants/divisions");
  }

  eventTypes() {
    return this._client.get<IRacingAPIResponse>("/data/constants/event_types");
  }
}

export default ConstantsAPI;
