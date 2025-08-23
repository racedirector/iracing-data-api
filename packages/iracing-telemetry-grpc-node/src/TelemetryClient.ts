import { EventEmitter } from "stream";
import { credentials } from "@grpc/grpc-js";
import { TelemetryKey } from "@iracing-data/telemetry-types";
import { google } from "./constants/google/protobuf/empty";
import { iracing } from "./constants/iracing-proto/telemetry";

export class TelemetryClient {
  private _client: iracing.telemetry.TelemetryClient;
  get client() {
    return this._client;
  }

  private _telemetryEmitter?: EventEmitter;
  get telemetryEmitter() {
    return this._telemetryEmitter;
  }

  constructor(url: string) {
    this._client = new iracing.telemetry.TelemetryClient(
      url,
      credentials.createInsecure()
    );
  }

  async dumpTelemetry() {
    const request = new google.protobuf.Empty();
    return await this.client.DumpTelemetryString(request);
  }

  async getTelemetry(keys: TelemetryKey[]) {
    const request = new iracing.telemetry.GetTelemetryRequest({
      keys: keys,
    });

    const response = await this.client.GetTelemetryString(request);
    return JSON.parse(response.telemetry);
  }

  /**
   * Subscribes to telemetry updates. Updates are emitted on the `telemetryEmitter` EventEmitter.
   */
  subscribeTelemetry(fps: number, keys: TelemetryKey[]) {
    // Create a new stream
    const request = new iracing.telemetry.TelemetrySubscriptionRequest({
      fps,
      keys,
    });

    return this.client.SubscribeTelemetryStringStream(request);
  }
}

export default TelemetryClient;
