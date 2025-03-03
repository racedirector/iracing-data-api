import { loadMocks } from "./data";
import type { INativeSDK } from "@iracing-data/irsdk-native";

export class MockSDK implements INativeSDK {
  public currDataVersion: number;

  public enableLogging: boolean;

  private _isRunning: boolean;

  private _sessionData: string | null = null;
  private _telemetryData: object | null = null;

  constructor() {
    this.currDataVersion = 1;
    this.enableLogging = false;
    this._isRunning = false;
    void this._loadMockData();
    console.warn(
      "Attempting to access iRacing SDK on unsupported platform!",
      "\nReturning mock SDK for testing purposes. (Only win32 supported)"
    );
  }

  private async _loadMockData(): Promise<void> {
    const { session, telemetry } = await loadMocks();
    this._sessionData = session;
    this._telemetryData = telemetry;
  }

  public startSDK(): boolean {
    this._isRunning = true;
    return true;
  }

  public stopSDK(): void {
    this._isRunning = false;
  }

  public isRunning(): boolean {
    return (
      this._isRunning &&
      this._sessionData !== null &&
      this._telemetryData !== null
    );
  }

  public waitForData(_timeout?: number): boolean {
    return this._isRunning;
  }

  public getSessionData(): string {
    return this._sessionData ?? "";
  }

  public getTelemetryData(): unknown {
    return this._telemetryData!;
  }

  public getTelemetryVariable(index: number): unknown;

  public getTelemetryVariable(name: unknown): unknown;

  // Really need to fix the types here.
  public getTelemetryVariable(name: number): unknown {
    if (typeof name === "number") {
      return Object.values(this._telemetryData!)[name] as unknown;
    }
    return this._telemetryData![name] as unknown;
  }
}
