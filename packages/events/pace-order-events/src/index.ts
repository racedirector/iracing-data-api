import { PaceMode } from "@iracing-data/telemetry-types";
import _ from "lodash";
import EventEmitter from "node:events";

export type PaceOrderEventMap = {
  change: {
    sessionTime: string;
    previousRows: number[];
    currentRows: number[];
    previousLines: number[];
    currentLines: number[];
    paceMode: PaceMode;
  };
  rowsChange: {
    sessionTime: string;
    previousRows: number[];
    currentRows: number[];
    paceMode: PaceMode;
  };
  rowChange: {
    sessionTime: string;
    previousRow: number;
    currentRow: number;
    carIndex: number;
    paceMode: PaceMode;
  };
  linesChange: {
    sessionTime: string;
    previousLines: number[];
    currentLines: number[];
    paceMode: PaceMode;
  };
  lineChange: {
    sessionTime: string;
    previousLine: number;
    currentLine: number;
    carIndex: number;
    paceMode: PaceMode;
  };
  carMoved: {
    sessionTime: string;
    previousLine: number;
    currentLine: number;
    previousRow: number;
    currentRow: number;
    carIndex: number;
    paceMode: PaceMode;
  };
};

type Payload<E extends keyof PaceOrderEventMap> = PaceOrderEventMap[E];

export class PaceOrderEventEmitter extends EventEmitter {
  private previousPaceRows: number[] = [];
  get paceRows() {
    return this.previousPaceRows;
  }

  private previousPaceLines: number[] = [];
  get paceLines() {
    return this.previousPaceLines;
  }

  private _paceMode: PaceMode = PaceMode.not_pacing;
  get paceMode() {
    return this._paceMode;
  }

  private _hasPerCarListeners: boolean = false;

  constructor() {
    super();
    this._configureListeners();
  }

  private _configureListeners() {
    super.on("newListener", (event) => {
      const isPerCarListener =
        event === "rowChange" || event === "lineChange" || event === "carMoved";

      if (!this._hasPerCarListeners && isPerCarListener) {
        this._hasPerCarListeners = true;
      }
    });

    super.on("removeListener", (event) => {
      const hasPerCarListeners = Boolean(
        this.listenerCount("rowChange") ||
          this.listenerCount("lineChange") ||
          this.listenerCount("carMoved")
      );

      if (this._hasPerCarListeners !== hasPerCarListeners) {
        this._hasPerCarListeners = hasPerCarListeners;
      }
    });
  }

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
    paceMode: PaceMode,
    sessionTime: string,
    length = Math.min(paceLines.length, paceRows.length)
  ) {
    if (this.paceMode !== paceMode) {
      this._paceMode = paceMode;
    }

    if (length === 0) return;

    const prevLen = Math.min(
      this.previousPaceLines.length,
      this.previousPaceRows.length
    );

    if (prevLen === 0) {
      this.previousPaceLines = [...paceLines];
      this.previousPaceRows = [...paceRows];
      return;
    }

    // Detect if anything changed quickly (cheap checks first)
    let anyLineChanged = false;
    let anyRowChanged = false;

    const maxCompare = Math.min(length, prevLen);
    for (
      let i = 0;
      i < maxCompare && (!anyLineChanged || !anyRowChanged);
      i++
    ) {
      if (this.previousPaceLines[i] !== paceLines[i]) anyLineChanged = true;
      if (this.previousPaceRows[i] !== paceRows[i]) anyRowChanged = true;
    }

    // If no diffs in overlapping segment AND lengths are same, early exit
    if (!anyLineChanged && !anyRowChanged && length === prevLen) {
      return;
    }

    this.emit("change", {
      sessionTime,
      previousLines: this.previousPaceLines,
      currentLines: paceLines,
      previousRows: this.previousPaceRows,
      currentRows: paceRows,
      paceMode: this.paceMode,
    });

    if (anyLineChanged && this.listenerCount("linesChange")) {
      this.emit("linesChange", {
        sessionTime,
        previousLines: this.previousPaceLines,
        currentLines: paceLines,
        paceMode: this.paceMode,
      });
    }

    if (anyRowChanged && this.listenerCount("rowsChange")) {
      this.emit("rowsChange", {
        sessionTime,
        previousRows: this.previousPaceRows,
        currentRows: paceRows,
        paceMode: this.paceMode,
      });
    }

    // Emit per-car changes if we have listeners
    if (this._hasPerCarListeners) {
      for (let i = 0; i < length; i++) {
        const previousLine = this.previousPaceLines[i];
        const previousRow = this.previousPaceRows[i];
        const currentLine = paceLines[i];
        const currentRow = paceRows[i];

        const lineChanged = previousLine !== currentLine;
        const rowChanged = previousRow !== currentRow;

        if (!lineChanged && !rowChanged) continue;

        if (this.listenerCount("lineChange") && lineChanged) {
          this.emit("lineChange", {
            sessionTime,
            previousLine,
            currentLine,
            carIndex: i,
            paceMode: this.paceMode,
          });
        }

        if (this.listenerCount("rowChange") && rowChanged) {
          this.emit("rowChange", {
            sessionTime,
            previousRow,
            currentRow,
            carIndex: i,
            paceMode: this.paceMode,
          });
        }

        if (this.listenerCount("carMoved") && (lineChanged || rowChanged)) {
          this.emit("carMoved", {
            sessionTime,
            previousLine,
            currentLine,
            previousRow,
            currentRow,
            carIndex: i,
            paceMode: this.paceMode,
          });
        }
      }
    }

    // IMPORTANT: update internal state after processing; copy to avoid aliasing
    this.previousPaceLines = paceLines.slice(0, length);
    this.previousPaceRows = paceRows.slice(0, length);
  }
}

export default PaceOrderEventEmitter;
