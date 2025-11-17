import { TelemetryKey, TelemetryData } from "@iracing-data/telemetry-types";
import { AxiosInstance } from "axios";

export class TelemetryEndpoint {
  get client() {
    return this._client;
  }

  constructor(private _client: AxiosInstance) {}

  telemetry(keys: TelemetryKey[]) {
    return this._client.get<TelemetryData>("/telemetry", {
      params: {
        keys: keys.join(","),
      },
    });
  }
}

export default TelemetryEndpoint;
