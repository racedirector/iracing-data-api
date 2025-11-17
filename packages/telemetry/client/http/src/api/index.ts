import { AxiosInstance } from "axios";
import { SchemaEndpoint } from "./schema";
import { TelemetryEndpoint } from "./telemetry";

export class IRacingTelemetryAPI {
  get client() {
    return this._client;
  }

  private _schema: SchemaEndpoint;
  get schema() {
    return this._schema;
  }

  private _telemetry: TelemetryEndpoint;
  get telemetry() {
    return this._telemetry;
  }

  constructor(private _client: AxiosInstance) {
    this._schema = new SchemaEndpoint(_client);
    this._telemetry = new TelemetryEndpoint(_client);
  }
}

export default IRacingTelemetryAPI;
