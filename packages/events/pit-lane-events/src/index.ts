import _ from "lodash";
import { EventEmitter } from "node:events";

export type PitLaneEventMap = {
  /** Fired when pit lane transitions to open. */
  "pitlane:opened": {
    sessionTime: string;
  };
  /** Fired when pit lane transitions to closed. */
  "pitlane:closed": {
    sessionTime: string;
  };
  /** Fired when a car enters pit road. */
  "pitroad:entered": {
    sessionTime: string;
    carIndex: number;
    isPaceCar: boolean;
    isPitLaneOpen: boolean;
  };
  /** Fired when a car exits pit road. */
  "pitroad:exited": {
    sessionTime: string;
    carIndex: number;
    isPaceCar: boolean;
    isPitLaneOpen: boolean;
  };
};

type Payload<E extends keyof PitLaneEventMap> = PitLaneEventMap[E];

export class PitLaneEventEmitter extends EventEmitter {
  private previousIsPitLaneOpen?: boolean;
  private previousIsOnPitRoad: boolean[] = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof PitLaneEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof PitLaneEventMap>(
    event: E,
    payload: Payload<E>
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(
    isPitLaneOpen: boolean,
    isOnPitRoad: boolean[],
    paceCarIndex: number,
    sessionTime: string,
    length: number = isOnPitRoad.length
  ) {
    // Pit lane open/close transition
    if (this.previousIsPitLaneOpen === undefined) {
      this.previousIsPitLaneOpen = isPitLaneOpen;
    } else if (isPitLaneOpen !== this.previousIsPitLaneOpen) {
      if (isPitLaneOpen) {
        this.emit("pitlane:opened", { sessionTime });
      } else {
        this.emit("pitlane:closed", { sessionTime });
      }
      this.previousIsPitLaneOpen = isPitLaneOpen;
    }

    // Car-by-car pit road transitions
    if (_.isEmpty(this.previousIsOnPitRoad)) {
      this.previousIsOnPitRoad = [...isOnPitRoad];
    } else if (!_.isEqual(this.previousIsOnPitRoad, isOnPitRoad)) {
      for (let i = 0; i < length; i++) {
        const prev = this.previousIsOnPitRoad[i];
        const curr = isOnPitRoad[i];

        if (prev !== curr) {
          const isPaceCar = i === paceCarIndex;

          if (curr) {
            this.emit("pitroad:entered", {
              sessionTime,
              carIndex: i,
              isPaceCar,
              isPitLaneOpen,
            });
          } else {
            this.emit("pitroad:exited", {
              sessionTime,
              carIndex: i,
              isPaceCar,
              isPitLaneOpen,
            });
          }
        }
      }

      // IMPORTANT: update after processing, and copy the array
      this.previousIsOnPitRoad = [...isOnPitRoad];
    }
  }
}

export default PitLaneEventEmitter;
