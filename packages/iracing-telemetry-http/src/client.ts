import { AxiosInstance } from "axios";
import { IRacingTelemetryAPI } from "./api";

export class IRacingTelemetryAPIClient {
  private _api: IRacingTelemetryAPI;
  get api() {
    return this._api;
  }

  constructor(client: AxiosInstance) {
    this._api = new IRacingTelemetryAPI(client);
  }
}

export default IRacingTelemetryAPIClient;
