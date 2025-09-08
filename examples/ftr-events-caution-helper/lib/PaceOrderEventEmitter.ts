import _ from "lodash";
import EventEmitter from "node:events";

export type PaceOrderEventMap = {
  rowChange: {
    sessionTime: string;
    previousRow: number;
    currentRow: number;
    carIndex: number;
  };
  lineChange: {
    sessionTime: string;
    previousLine: number;
    currentLine: number;
    carIndex: number;
  };
};

type Payload<E extends keyof PaceOrderEventMap> = PaceOrderEventMap[E];

export class PaceOrderEventEmitter extends EventEmitter {
  private previousPaceRows: number[] = [];
  private previousPaceLines: number[] = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof PaceOrderEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof PaceOrderEventMap>(
    event: E,
    payload: Payload<E>
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(
    paceLines: number[],
    paceRows: number[],
    sessionTime: string,
    length: number = paceLines.length
  ) {
    if (_.isEmpty(this.previousPaceLines)) {
      this.previousPaceLines = paceLines;
    } else if (!_.isEqual(this.previousPaceLines, paceLines)) {
      for (let i = 0; i < length; i++) {
        const previousLine = this.previousPaceLines[i];
        const currentLine = paceLines[i];

        if (previousLine !== currentLine) {
          this.emit("lineChange", {
            sessionTime,
            previousLine,
            currentLine,
            carIndex: i,
          });
        }
      }

      this.previousPaceLines = paceLines;
    }

    if (_.isEmpty(this.previousPaceRows)) {
      this.previousPaceRows = paceRows;
    } else if (!_.isEqual(this.previousPaceRows, paceRows)) {
      for (let i = 0; i < length; i++) {
        const previousRow = this.previousPaceRows[i];
        const currentRow = paceRows[i];

        if (previousRow !== currentRow) {
          this.emit("rowChange", {
            sessionTime,
            previousRow,
            currentRow,
            carIndex: i,
          });
        }
      }

      this.previousPaceRows = paceRows;
    }
  }
}

export default PaceOrderEventEmitter;
