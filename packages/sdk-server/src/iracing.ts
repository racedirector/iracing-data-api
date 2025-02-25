import { IRacingBridge, Session, Telemetry } from "@iracing-data/sdk";
import { subsystemLogger } from "./logger";

const logger = subsystemLogger("server:iracing");

export class IRacing {
  private _bridge: IRacingBridge;
  private _simConnected = false;
  private _telemetryConnected = false;

  constructor() {
    this._bridge = new IRacingBridge({
      retryConnection: true,
      retryIntervalSeconds: 1,
    });

    this._registerEventListeners();
    this.bridge.start();
  }

  get bridge() {
    return this._bridge;
  }

  get isSimConnected() {
    return this._simConnected;
  }

  get isTelemetryConnected() {
    return this._telemetryConnected;
  }

  destroy() {
    logger.info("Stopping iRacing bridge...");
    this.bridge.destroy();
  }

  private _registerEventListeners() {
    this.bridge.connectionEmitter
      .on("simConnect", this.onSimConnectEvent.bind(this))
      .on("telemetryConnect", this.onTelemetryConnectEvent.bind(this));

    this.bridge.telemetryEmitter
      .once("telemetry", this.onTelemetryEvent.bind(this))
      .once("session", this.onSessionEvent.bind(this));
  }

  private onSimConnectEvent(connected: boolean) {
    logger.info(`Sim ${connected ? "connected" : "disconnected"}`);
    this._simConnected = connected;
  }

  private onTelemetryConnectEvent(connected: boolean) {
    logger.info(`Telemetry ${connected ? "connected" : "disconnected"}`);
    this._telemetryConnected = connected;
  }

  private onTelemetryEvent(telemetry: Telemetry) {
    logger.debug("Telemetry event", telemetry);
  }

  private onSessionEvent(telemetry: Session) {
    logger.debug("Session event", telemetry);
  }
}

export default IRacing;
