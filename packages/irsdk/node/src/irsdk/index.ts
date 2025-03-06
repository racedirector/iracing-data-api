import { getSimStatus } from "../utils";

export class IRacingSDK {
  static async isSimRunning() {
    try {
      return await getSimStatus();
    } catch {
      return false;
    }
  }

  private _isRunning: boolean = false;
  get isRunning() {
    return this._isRunning;
  }

  private _waitForSimRunning: Promise<void>;
  get waitForSimRunning() {
    return this._waitForSimRunning;
  }

  constructor() {
    this._waitForSimRunning = new Promise<void>((resolve) => {
      const check = async () => {
        if (await IRacingSDK.isSimRunning()) {
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
  simIsRunning() {
    return IRacingSDK.isSimRunning();
  }
}

export default IRacingSDK;
