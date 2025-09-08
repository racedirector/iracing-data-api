import { EventEmitter } from "node:events";
import _ from "lodash";
import {
  Flags,
  isBlack,
  isBlue,
  isCheckered,
  isCrossed,
  isDebris,
  isDisqualify,
  isFiveToGo,
  isFurled,
  isRepair,
  isServicible,
  isTenToGo,
  isWhite,
  isYellow,
  isYellowWaving,
} from "@iracing-data/telemetry-types";

type CarSessionFlagEventPayload = {
  sessionTime: string;
  flags: Flags;
  previousFlags: Flags;
  carIndex: number;
};

export type CarSessionFlagEventMap = {
  checkered: CarSessionFlagEventPayload;
  white: CarSessionFlagEventPayload;
  yellow: CarSessionFlagEventPayload;
  black: CarSessionFlagEventPayload;
  blue: CarSessionFlagEventPayload;
  debris: CarSessionFlagEventPayload;
  crossed: CarSessionFlagEventPayload;
  yellowWaving: CarSessionFlagEventPayload;
  tenToGo: CarSessionFlagEventPayload;
  fiveToGo: CarSessionFlagEventPayload;
  disqualify: CarSessionFlagEventPayload;
  servicible: CarSessionFlagEventPayload;
  furled: CarSessionFlagEventPayload;
  repair: CarSessionFlagEventPayload;
  // Clearable flags
  "black:cleared": CarSessionFlagEventPayload;
  "blue:cleared": CarSessionFlagEventPayload;
  "disqualify:cleared": CarSessionFlagEventPayload;
  "servicible:cleared": CarSessionFlagEventPayload;
  "furled:cleared": CarSessionFlagEventPayload;
  "repair:cleared": CarSessionFlagEventPayload;
};

type Payload<E extends keyof CarSessionFlagEventMap> =
  CarSessionFlagEventMap[E];

export class CarSessionFlagEventEmitter extends EventEmitter {
  private previousSessionFlags: Flags[] = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof CarSessionFlagEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof CarSessionFlagEventMap>(
    event: E,
    payload: Payload<E>
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(
    indexedSessionFlags: Flags[],
    sessionTime: string,
    length: number = indexedSessionFlags.length
  ) {
    if (_.isEmpty(this.previousSessionFlags)) {
      this.previousSessionFlags = indexedSessionFlags;
      return;
    }

    if (!_.isEqual(this.previousSessionFlags, indexedSessionFlags)) {
      for (let i = 0; i < length; i++) {
        const previousFlag = this.previousSessionFlags[i];
        const currentFlag = indexedSessionFlags[i];

        if (previousFlag !== currentFlag) {
          if (isCheckered(currentFlag)) {
            this.emit("checkered", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isWhite(currentFlag)) {
            this.emit("white", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isYellow(currentFlag)) {
            this.emit("yellow", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isBlack(currentFlag)) {
            this.emit("black", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (isBlack(previousFlag)) {
            this.emit("black:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isBlue(currentFlag)) {
            this.emit("blue", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (isBlue(previousFlag)) {
            this.emit("blue:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isDebris(currentFlag)) {
            this.emit("debris", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isCrossed(currentFlag)) {
            this.emit("crossed", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isYellowWaving(currentFlag)) {
            this.emit("yellowWaving", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isTenToGo(currentFlag)) {
            this.emit("tenToGo", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isFiveToGo(currentFlag)) {
            this.emit("fiveToGo", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isDisqualify(currentFlag)) {
            this.emit("disqualify", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (isDisqualify(previousFlag)) {
            this.emit("disqualify:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isServicible(currentFlag)) {
            this.emit("servicible", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (isServicible(previousFlag)) {
            this.emit("servicible:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isFurled(currentFlag)) {
            this.emit("furled", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (isFurled(previousFlag)) {
            this.emit("furled:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isRepair(currentFlag)) {
            this.emit("repair", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (isRepair(previousFlag)) {
            this.emit("repair:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }
        }
      }

      this.previousSessionFlags = indexedSessionFlags;
    }
  }
}

export default CarSessionFlagEventEmitter;
