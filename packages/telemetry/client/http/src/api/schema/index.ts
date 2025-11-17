import { AxiosInstance } from "axios";

export class SchemaEndpoint {
  get client() {
    return this._client;
  }

  constructor(private _client: AxiosInstance) {}

  schemaTelemetry() {
    return this._client.get("/schema/telemetry");
  }

  schemaSession() {
    return this._client.get("/schema/session");
  }
}

export default SchemaEndpoint;
