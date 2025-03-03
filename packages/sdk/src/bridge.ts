import assert from "node:assert";
import { IRacingSDK } from "irsdk-node";
import {
  IRacingConnectionEmitter,
  SimConnectionEmitter,
  TelemetryConnectionEmitter,
  TelemetryEmitter,
} from "./types";
import { sleep, sleepMs } from "./util";

/**
 * Options for creating a new IRacing Bridge instance.
 */
export interface IRacingBridgeOptions {
  /**
   * The number of frames per second to run the bridge at.
   * @min > 0
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
  /** Public State */

  /** Private State */

  // Events
  private _simConnectionEmitter = new SimConnectionEmitter();
  private _telemetryConnectionEmitter = new TelemetryConnectionEmitter();
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

  get simConnectionEmitter() {
    return this._simConnectionEmitter;
  }

  get telemetryConnectionEmitter() {
    return this._telemetryConnectionEmitter;
  }

  get connectionEmitter() {
    return this._connectionEmitter;
  }

  get telemetryEmitter() {
    return this._telemetryEmitter;
  }

  private get retryEnabled() {
    return this._retryConnection;
  }

  private get shouldRetrySimConnection() {
    const hasRetriesRemaining =
      this._maxRetryCount === -1 || this._retryAttempts < this._maxRetryCount;

    return this.retryEnabled && hasRetriesRemaining;
  }

  get simConnected() {
    return new Promise<void>((resolve, reject) => {
      console.debug("Checking for iRacing connection...");

      const checkConnection = async () => {
        if (await IRacingSDK.IsSimRunning()) {
          console.debug("iRacing is running.");
          clearInterval(interval);
          resolve();
        } else {
          if (!this.shouldRetrySimConnection) {
            clearInterval(interval);
            reject(new Error("Could not connect to iRacing."));
          } else {
            console.debug(
              `iRacing is not running.${
                this._maxRetryCount >= 0
                  ? ` Retries remaining: ${
                      this._maxRetryCount - this._retryAttempts
                    }`
                  : " Retrying..."
              }`
            );

            this._retryAttempts++;
          }
        }
      };

      checkConnection();
      const interval = setInterval(
        checkConnection,
        this._retryIntervalSeconds * 1000
      );
    });
  }

  get simDisconnected() {
    return new Promise<void>((resolve) => {
      const checkConnection = async () => {
        if (!(await IRacingSDK.IsSimRunning())) {
          clearInterval(interval);
          resolve();
        }
      };

      checkConnection();
      const interval = setInterval(
        checkConnection,
        this._retryIntervalSeconds * 1000
      );
    });
  }

  /**
   * Starts the telemetry loop.
   * @returns this for chaining
   */
  start() {
    // Start loops
    this._running = true;
    this._loop();
  }

  /**
   * Returns a promise that resolves when the bridge connects
   */
  async startAsync() {
    this._running = true;

    await this.simConnected;

    this.sdk.startSDK();
  }

  /**
   * Stops the telemetry loop.
   */
  stop() {
    // Stop the SDK
    this.sdk?.stopSDK();
    // Reset state
    this._retryAttempts = 0;

    // Stop loops
    this._running = false;
  }

  /**
   * Stops the SDK and removes all registered listeners.
   */
  destroy() {
    this.stop();

    // Remove all event listeners
    this._simConnectionEmitter.removeAllListeners();
    this._telemetryConnectionEmitter.removeAllListeners();
    this._connectionEmitter.removeAllListeners();
    this._telemetryEmitter.removeAllListeners();
  }

  *telemetryGenerator() {
    if (this.sdk.waitForData(this.fpsMs)) {
      yield this.sdk.getTelemetry();
    }
  }

  *sessionGenerator() {
    if (this.sdk.waitForData(this.fpsMs)) {
      yield this.sdk.getSessionData();
    }
  }

  private async _loop() {
    console.debug("Checking for iRacing connection...");
    while (this._running) {
      console.debug("loop");
      if (await this.isSimRunning()) {
        if (!this._connected) {
          console.debug("iRacing is running.");
          this._connected = true;
          this.simConnectionEmitter.emit("connect");
          this.connectionEmitter.emit("simConnect", true);

          // this.sdk.autoEnableTelemetry = this.autoEnableTelemetry;
          await this._telemetryLoop();
        }
      } else {
        if (this._connected) {
          this._connected = false;
          this.connectionEmitter.emit("simConnect", false);
          this.simConnectionEmitter.emit("disconnect");

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

    this.telemetryConnectionEmitter.emit("connect");
    this.connectionEmitter.emit("telemetryConnect", true);

    // Wait 1s for data to be available
    while (this.sdk.waitForData(1000)) {
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

      // Sleep for the provided FPS
      // ???: Should this be in the `waitForData` call?
      await sleepMs(this.fpsMs);
    }

    this.connectionEmitter.emit("telemetryConnect", false);
    this.telemetryConnectionEmitter.emit("disconnect");
  }
}

export default IRacingBridge;
