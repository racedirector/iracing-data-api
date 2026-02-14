import { EventEmitter } from "node:events";
import {
  isEndOfLine,
  isFreePass,
  isWavedAround,
  PaceFlags,
} from "@iracing-data/telemetry-types";
import _ from "lodash";

export type PaceFlagEventMap = {
  endOfLine: {
    sessionTime: string;
    carIndex: number;
  };
  freePass: {
    sessionTime: string;
    carIndex: number;
  };
  waveAround: {
    sessionTime: string;
    carIndex: number;
  };
  cleared: {
    sessionTime: string;
    carIndex: number;
  };
};

type Payload<E extends keyof PaceFlagEventMap> = PaceFlagEventMap[E];

export class PaceFlagEventEmitter extends EventEmitter {
  private previousPaceFlags: PaceFlags[] = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof PaceFlagEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof PaceFlagEventMap>(
    event: E,
    payload: Payload<E>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(
    paceFlags: PaceFlags[],
    sessionTime: string,
    length: number = paceFlags.length,
  ) {
    if (_.isEmpty(this.previousPaceFlags)) {
      this.previousPaceFlags = paceFlags;
      return;
    }

    if (!_.isEqual(this.previousPaceFlags, paceFlags)) {
      for (let i = 0; i < length; i++) {
        const previousFlag = this.previousPaceFlags[i];
        const currentFlag = paceFlags[i];

        if (previousFlag !== currentFlag) {
          if (
            (isEndOfLine(previousFlag) ||
              isFreePass(previousFlag) ||
              isWavedAround(previousFlag)) &&
            !isEndOfLine(currentFlag) &&
            !isFreePass(currentFlag) &&
            !isWavedAround(currentFlag)
          ) {
            this.emit("cleared", {
              sessionTime,
              carIndex: i,
            });
          }

          if (isEndOfLine(currentFlag)) {
            this.emit("endOfLine", {
              sessionTime,
              carIndex: i,
            });
          }

          if (isFreePass(currentFlag)) {
            this.emit("freePass", {
              sessionTime,
              carIndex: i,
            });
          }

          if (isWavedAround(currentFlag)) {
            this.emit("waveAround", {
              sessionTime,
              carIndex: i,
            });
          }
        }
      }

      this.previousPaceFlags = paceFlags;
    }
  }
}

export default PaceFlagEventEmitter;
