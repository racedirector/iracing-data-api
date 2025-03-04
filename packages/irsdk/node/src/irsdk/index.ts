import { getSimStatus } from "../utils";

export class IRacingSDK {
  static async isSimRunning() {
    try {
      return await getSimStatus();
    } catch (e) {
      console.error(e);
    }

    return false;
  }
}

export default IRacingSDK;
