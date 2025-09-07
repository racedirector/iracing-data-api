import {
  isEndOfLine,
  isFreePass,
  isWavedAround,
  PaceFlags,
} from "@iracing-data/telemetry-types";
import _ from "lodash";
import { logger as parentLogger } from "./logger";

const logger = parentLogger.child({
  module: "PaceFlagManager",
});

export class PaceFlagManager {
  private previousPaceFlags: PaceFlags[] = [];

  process(
    paceFlags: PaceFlags[],
    sessionTime: string,
    sessionTimeOfDay: string,
    length: number = paceFlags.length
  ) {
    if (!_.isEqual(this.previousPaceFlags, paceFlags)) {
      for (let i = 0; i < length; i++) {
        const previousFlag = this.previousPaceFlags[i];
        const currentFlag = paceFlags[i];

        if (previousFlag !== currentFlag) {
          let message: string | undefined;
          if (isEndOfLine(currentFlag)) {
            message = "Player received EOL.";
          }

          if (isFreePass(currentFlag)) {
            message = "Player receieved Free Pass.";
          }

          if (isWavedAround(currentFlag)) {
            message = "Player received Wave Around";
          }

          if (message) {
            logger.info(
              {
                sessionTime,
                sessionTimeOfDay,
                carIndex: i,
              },
              message
            );
          }
        }
      }

      this.previousPaceFlags = paceFlags;
    }
  }
}

export default PaceFlagManager;
