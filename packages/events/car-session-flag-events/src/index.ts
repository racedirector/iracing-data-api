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
  changed: CarSessionFlagEventPayload;
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
    if (!_.isEqual(this.previousSessionFlags, indexedSessionFlags)) {
      for (let i = 0; i < length; i++) {
        const previousFlag = this.previousSessionFlags[i];
        const currentFlag = indexedSessionFlags[i];

        if (previousFlag !== currentFlag) {
          this.emit("changed", {
            sessionTime,
            flags: currentFlag,
            previousFlags: previousFlag,
            carIndex: i,
          });

          if (isCheckered(currentFlag) && !isCheckered(previousFlag)) {
            this.emit("checkered", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isWhite(currentFlag) && !isWhite(previousFlag)) {
            this.emit("white", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isYellow(currentFlag) && !isYellow(previousFlag)) {
            this.emit("yellow", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isBlack(currentFlag) && !isBlack(previousFlag)) {
            this.emit("black", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (!isBlack(currentFlag) && isBlack(previousFlag)) {
            this.emit("black:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isBlue(currentFlag) && !isBlue(previousFlag)) {
            this.emit("blue", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (!isBlue(currentFlag) && isBlue(previousFlag)) {
            this.emit("blue:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isDebris(currentFlag) && !isDebris(previousFlag)) {
            this.emit("debris", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isCrossed(currentFlag) && !isCrossed(previousFlag)) {
            this.emit("crossed", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isYellowWaving(currentFlag) && !isYellowWaving(previousFlag)) {
            this.emit("yellowWaving", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isTenToGo(currentFlag) && !isTenToGo(previousFlag)) {
            this.emit("tenToGo", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isFiveToGo(currentFlag) && !isFiveToGo(previousFlag)) {
            this.emit("fiveToGo", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isDisqualify(currentFlag) && !isDisqualify(previousFlag)) {
            this.emit("disqualify", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (!isDisqualify(currentFlag) && isDisqualify(previousFlag)) {
            this.emit("disqualify:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isServicible(currentFlag) && !isServicible(previousFlag)) {
            this.emit("servicible", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (!isServicible(currentFlag) && isServicible(previousFlag)) {
            this.emit("servicible:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isFurled(currentFlag) && !isFurled(previousFlag)) {
            this.emit("furled", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (!isFurled(currentFlag) && isFurled(previousFlag)) {
            this.emit("furled:cleared", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          }

          if (isRepair(currentFlag) && !isRepair(previousFlag)) {
            this.emit("repair", {
              sessionTime,
              flags: currentFlag,
              previousFlags: previousFlag,
              carIndex: i,
            });
          } else if (!isRepair(currentFlag) && isRepair(previousFlag)) {
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
