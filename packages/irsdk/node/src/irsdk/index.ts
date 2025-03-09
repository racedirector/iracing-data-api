import { NativeSDK } from "@iracing-data/irsdk-native";
import { isSimRunning } from "../utils";

export class IRacingSDK {
  static async isSimRunning(): Promise<boolean> {
    return isSimRunning();
  }

  private _sdk: NativeSDK = new NativeSDK();

  private _waitForSimRunning: Promise<void>;
  get waitForSimRunning() {
    return this._waitForSimRunning;
  }

  private _waitForSimNotRunning: Promise<void>;
  get waitForSimNotRunning() {
    return this._waitForSimNotRunning;
  }

  get isConnected(): boolean {
    return this._sdk.isConnected;
  }

  constructor() {
    this._waitForSimRunning = new Promise<void>((resolve) => {
      const check = async () => {
        if (await this.simIsRunning()) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };

      check();
    });

    this._waitForSimNotRunning = new Promise<void>((resolve) => {
      const check = async () => {
        if (!(await this.simIsRunning())) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };

      check();
    });
  }

  /**
   * A promise that returns true or false based on whether the sim is running
   *
   * @returns {boolean} Whether the sim is running
   */
  simIsRunning(): Promise<boolean> {
    return IRacingSDK.isSimRunning();
  }

  async simIsConnected(): Promise<boolean> {
    const simIsRunning = await this.simIsRunning();
    const sdkConnected = this.isConnected;
    return simIsRunning && sdkConnected;
  }
}

export default IRacingSDK;
