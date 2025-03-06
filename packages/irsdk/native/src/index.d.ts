import EventEmitter from "events";

export class TelemetryEmitter extends EventEmitter {}
export class SessionEmitter extends EventEmitter {}

export class NativeSDK {
  enableLogging: boolean;

  /**
   * Wait for data synchronously.
   * @param timeout time timeout in milliseconds
   */
  public waitForData(timeout: number): void;

  /**
   * Wait for data asynchronously.
   * @param timeout time timeout in milliseconds
   */
  public waitForDataAsync(timeout: number): Promise<void>;

  /**
   * Resolves with the session string. Rejects if not connected to iRacing.
   */
  public waitForSessionDataUpdate(): Promise<string>;
}
