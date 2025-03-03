export interface INativeSDK {
  enableLogging: boolean;

  startSDK(): boolean;
  stopSDK(): void;

  // State
  isRunning(): boolean;

  waitForData(timeout?: number): boolean;
  getSessionData(): string;
  getTelemetryData(): unknown;
  getTelemetryVariable(index: number): unknown;
}

export class NativeSDK implements INativeSDK {
  enableLogging: boolean;

  public startSDK(): boolean;

  public stopSDK(): void;

  public isRunning(): boolean;

  public waitForData(timeout?: number): boolean;

  public getSessionData(): string;

  public getTelemetryData(): unknown;

  public getTelemetryVariable(index: number): unknown;
}
