import assert from "node:assert";
import { IRacingSDK } from "irsdk-node";
import { IRacingConnectionEmitter, TelemetryEmitter } from "./types";
import { sleep } from "./util";

/**
 * Options for creating a new IRacing Bridge instance.
 */
export interface IRacingBridgeOptions {
  /**
   * The number of frames per second to run the bridge at.
   * @min 1
   * @max 60
   * @default 1
   */
  fps?: number;

  /**
   * Auto-enable telemetry on the SDK instance.
   * @default true
   */
  autoEnableTelemetry?: boolean;

  /**
   * Auto-start the telemetry loop on initialization.
   * @default false
   */
  autoStart?: boolean;

  /**
   * Retry the connection if it fails.
   * @default false
   */
  retryConnection?: boolean;

  /**
   * The number of seconds to wait before retrying the connection.
   * @default 1
   */
  retryIntervalSeconds?: number;

  /**
   * The max number of times to retry the connection.
   * This indicates the number of retries, not including the initial attempt.
   * @default -1 (infinite)
   */
  maxRetryCount?: number;
}

/**
 * A bridge between the iRacing SDK and a telemetry client.
 * Manages the lifecycle of the SDK connection, emitting telemetry and session data.
 */
export class IRacingBridge {
  // Events
  private _connectionEmitter = new IRacingConnectionEmitter();
  private _telemetryEmitter = new TelemetryEmitter();

  // SDK
  private _sdk: IRacingSDK = new IRacingSDK();

  // State
  private _retryConnection: boolean;
  private _retryIntervalSeconds: number;
  private _maxRetryCount: number;
  private _autoEnableTelemetry: boolean;
  private _fps: number;
  private _running: boolean = false;
  private _retryAttempts: number = 0;
  private _connected: boolean = false;

  constructor(options?: IRacingBridgeOptions) {
    // Initialize options
    this._autoEnableTelemetry = options?.autoEnableTelemetry ?? true;
    this._retryConnection = options?.retryConnection ?? false;
    this._retryIntervalSeconds = options?.retryIntervalSeconds ?? 1;
    this._maxRetryCount = options?.maxRetryCount ?? -1;
    this._fps = options?.fps ?? 1;

    assert(
      this._fps > 0 && this._fps <= 60,
      `Invalid FPS value ${this._fps}. FPS must be between 1 and 60.`
    );

    // If auto start enabled, start the loop
    if (options?.autoStart) {
      this.start();
    }
  }

  /**
   * The iRacing SDK instance.
   */
  get sdk() {
    return this._sdk;
  }

  /**
   * Whether the bridge is currently
   */
  get isRunning() {
    return this._running;
  }

  async isSimRunning() {
    return IRacingSDK.IsSimRunning();
  }

  /**
   * The number of frames per second to run the bridge at.
   * Min: 1, max: 60
   */
  get fps() {
    return this._fps;
  }

  private get fpsMs() {
    return (1 / this._fps) * 1000;
  }

  /**
   * Auto-enable telemetry on the SDK.
   * Can only be changed between sessions.
   */
  get autoEnableTelemetry() {
    return this._autoEnableTelemetry;
  }

  /**
   * Set auto-enable telemetry on the SDK.
   * @throws If the bridge is currently running.
   */
  set autoEnableTelemetry(value: boolean) {
    assert(!this.isRunning, "Cannot change autoEnableTelemetry while running.");
    this._autoEnableTelemetry = value;
  }

  get connectionEmitter() {
    return this._connectionEmitter;
  }

  get telemetryEmitter() {
    return this._telemetryEmitter;
  }

  get isConnected() {
    return this._connected;
  }

  /**
   * Starts the telemetry loop.
   * @returns this for chaining
   */
  start(): this {
    // Start loops
    this._running = true;
    this._loop();
    return this;
  }

  /**
   * Stops the telemetry loop.
   * @returns this for chaining
   */
  stop(): this {
    // Stop the SDK
    this.sdk?.stopSDK();
    // Reset state
    this._retryAttempts = 0;

    // Stop loops
    this._running = false;

    return this;
  }

  /**
   * Stops the SDK and removes all registered listeners.
   */
  async destroy() {
    this.stop();

    // Remove all event listeners
    this._connectionEmitter.removeAllListeners();
    this._telemetryEmitter.removeAllListeners();
  }

  private async _loop() {
    console.debug("Checking for iRacing connection...");
    while (this._running) {
      if (await this.isSimRunning()) {
        console.debug("iRacing is running.");
        if (!this.isConnected) {
          this.connectionEmitter.emit("simConnect", true);
          this._connected = true;
        }

        this.sdk.autoEnableTelemetry = this.autoEnableTelemetry;
        await this._telemetryLoop();
      } else {
        if (this.isConnected) {
          this.connectionEmitter.emit("simConnect", false);
          this._connected = false;
          console.debug("iRacing disconnected.");
        } else {
          console.debug("iRacing is not running.");
          if (!this._retryConnection) {
            this.stop();
          } else {
            if (
              this._maxRetryCount !== -1 &&
              this._retryAttempts >= this._maxRetryCount
            ) {
              console.debug("Exceeded maximum retry count.");
              this.stop();
              break;
            } else {
              this._retryAttempts++;
            }

            console.debug(
              `Retrying connection in ${this._retryIntervalSeconds} second(s).`
            );

            // Wait for the retry interval
            await sleep(this._retryIntervalSeconds);
          }
        }
      }
    }
  }

  private async _telemetryLoop() {
    // TODO: Ensure we can bail out if _running changes.
    await this.sdk.ready();

    this.connectionEmitter.emit("telemetryConnect", true);

    // Wait 1s for data to be available
    while (this.sdk.waitForData(this.fpsMs)) {
      const telemetry = this.sdk.getTelemetry();
      const session = this.sdk.getSessionData();

      // If we have telemetry, emit it
      // ???: Does this properly diff? Like, if nothing changes, does it not emit?
      if (telemetry) {
        this.telemetryEmitter.emit("telemetry", telemetry);
      }

      // If we have session data, emit it
      // ???: Does this properly diff? Like, if nothing changes, does it not emit?
      if (session) {
        this.telemetryEmitter.emit("session", session);
      }
    }

    this.connectionEmitter.emit("telemetryConnect", false);
  }
}

export default IRacingBridge;
