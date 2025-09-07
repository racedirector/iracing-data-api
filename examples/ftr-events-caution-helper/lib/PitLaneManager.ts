import _ from "lodash";
import { logger as parentLogger } from "./logger";

const logger = parentLogger.child({
  module: "PitLaneManager",
});

export class PitLaneManager {
  private previousIsPitLaneOpen = false;
  private previousIsOnPitRoad: boolean[] = [];

  process(
    isPitLaneOpen: boolean,
    isOnPitRoad: boolean[],
    paceCarIndex: number,
    sessionTime: string,
    sessionTimeOfDay: string,
    length: number = isOnPitRoad.length
  ) {
    // Update pit lane open state
    if (isPitLaneOpen !== this.previousIsPitLaneOpen) {
      logger.info(
        {
          sessionTime,
          sessionTimeOfDay,
        },
        `Pit lane ${isPitLaneOpen ? "opened" : "closed"}`
      );

      this.previousIsPitLaneOpen = isPitLaneOpen;
    }

    if (!_.isEqual(this.previousIsOnPitRoad, isOnPitRoad)) {
      for (let i = 0; i < length; i++) {
        const previousIsOnPitRoad = this.previousIsOnPitRoad[i];
        const currentIsOnPitRoad = isOnPitRoad[i];

        if (previousIsOnPitRoad !== currentIsOnPitRoad) {
          const actor = i === paceCarIndex ? "Pace car" : `Car index ${i}`;
          logger.info(
            {
              sessionTime,
              sessionTimeOfDay,
              carIndex: i,
            },
            `${actor} ${currentIsOnPitRoad ? "entered" : "exited"} ${isPitLaneOpen ? "open" : "closed"} pit road.`
          );
        }

        this.previousIsOnPitRoad = isOnPitRoad;
      }
    }
  }
}

export default PitLaneManager;
