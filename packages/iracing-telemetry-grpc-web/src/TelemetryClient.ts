import { TelemetryKey } from "@iracing-data/telemetry-types";
import * as empty from "google-protobuf/google/protobuf/empty_pb";
import {
  GetTelemetryRequest,
  TelemetrySubscriptionRequest,
} from "./constants/iracing-proto/telemetry_pb";
import { TelemetryClient as TelemetryServiceClient } from "./constants/iracing-proto/TelemetryServiceClientPb";

export class TelemetryClient {
  private _client: TelemetryServiceClient;
  get client() {
    return this._client;
  }

  constructor(url: string) {
    this._client = new TelemetryServiceClient(url);
  }

  async dumpTelemetry() {
    return await this.client.dumpTelemetryString(new empty.Empty(), null);
  }

  async getTelemetry(keys: TelemetryKey[]) {
    const request = new GetTelemetryRequest();
    request.setKeysList(keys);

    return await this.client.getTelemetryString(request, null);
  }

  /**
   * Subscribes to telemetry updates. Updates are emitted on the `telemetryEmitter` EventEmitter.
   */
  subscribeTelemetry(fps: number, keys: TelemetryKey[]) {
    const request = new TelemetrySubscriptionRequest();
    request.setFps(fps);
    request.setKeysList(keys);

    // Create a new stream
    return this.client.subscribeTelemetryStringStream(request);
  }
}

export default TelemetryClient;
