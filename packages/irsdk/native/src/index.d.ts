import EventEmitter from "events";

export class TelemetryEmitter extends EventEmitter {}
export class SessionEmitter extends EventEmitter {}

export class NativeSDK {
  enableLogging: boolean;

  /**
   * Wait for data synchronously.
   * @param timeout time timeout in milliseconds
   */
  public waitForData(timeout: number): boolean;

  /**
   * Wait for data asynchronously.
   * @param timeout time timeout in milliseconds
   */
  public waitForDataAsync(timeout: number): Promise<boolean>;

  /**
   * Resolves with the session string. Rejects if not connected to iRacing.
   */
  public waitForSessionDataUpdate(): Promise<string>;

  /**
   * Returns the current session string count.
   */
  public getSessionCount(): number;

  /**
   * Returns whether the session string has an update.
   */
  public hasSessionInfoUpdate(): boolean;

  public getSessionStringValue(path: string): number;

  /**
   * Gets the session string.
   */
  public getSessionString(): string;

  public getVarIdx(name: string): number;

  /**
   * Get the type of the variable.
   *
   * @param idx The variable's index
   */
  public getVarType(idx: number): number;

  /**
   * Returns the number of elements in an array, or 1 if not an array.
   * @param idx The index of the variable to look at
   */
  public getVarCount(idx: number): number;

  /**
   * Retrieves the data at the given index as a boolean.
   *
   * @param idx The variable's index
   * @param entry The array offset.
   * @default 0
   */
  public getVarBool(idx: number, entry: number): boolean;

  /**
   * Retrieves the data at the given index as an integer.
   *
   * @param idx The variable's index
   * @param entry The array offset.
   * @default 0
   */
  public getVarInt(idx: number, entry: number): number;

  /**
   * Retrieves the data at the given index as a float.
   *
   * @param idx The variable's index
   * @param entry The array offset.
   * @default 0
   */
  public getVarFloat(idx: number, entry: number): number;

  /**
   * Retrieves the data at the given index as a double.
   *
   * @param idx The variable's index
   * @param entry The array offset.
   * @default 0
   */
  public getVarDouble(idx: number, entry: number): number;
}
