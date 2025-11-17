import { EventEmitter } from "node:events";
import {
  isDoubleFile,
  isLeftLine,
  isRightLine,
  PaceMode,
  Session,
} from "@iracing-data/telemetry-types";
import { AsciiTable3 } from "ascii-table3";

function nameForLineValue(value: number) {
  if (isLeftLine(value)) {
    return "Left";
  } else if (isRightLine(value)) {
    return "Right";
  }

  return "Unknown";
}

type PaceOrderTableRow = {
  row: number;
  line: number;
  carNumber: string;
  displayName: string;
};

export type PaceOrderFormatterEventMap = {
  update: void;
};

type Payload<E extends keyof PaceOrderFormatterEventMap> =
  PaceOrderFormatterEventMap[E];

export class PaceOrderFormatter extends EventEmitter {
  private _paceMode: PaceMode = PaceMode.not_pacing;

  private _orderData: PaceOrderTableRow[] = [];
  private _unassignedData: PaceOrderTableRow[] = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof PaceOrderFormatterEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof PaceOrderFormatterEventMap>(
    event: E,
    payload: Payload<E>
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  update(
    paceRows: number[],
    paceLines: number[],
    drivers: Session["DriverInfo"]["Drivers"],
    paceMode: PaceMode,
    isTeamRacing: boolean = false
  ) {
    if (this._orderData.length) {
      this._orderData = [];
    }

    if (this._unassignedData.length) {
      this._unassignedData = [];
    }

    if (this._paceMode !== paceMode) {
      this._paceMode = paceMode;
    }

    for (var i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      const row = paceRows[i];
      const line = paceLines[i];
      const rowData: PaceOrderTableRow = {
        row: row + 1,
        line,
        carNumber: `#${driver.CarNumber}`,
        displayName: isTeamRacing ? driver.TeamName : driver.UserName,
      };

      if (line === -1) {
        this._unassignedData.push(rowData);
      } else {
        this._orderData.push(rowData);
      }
    }

    this._orderData.sort((a, b) => {
      return a.row - b.row;
    });

    this._unassignedData.sort((a, b) => {
      return a.row - b.row;
    });

    this.emit("update", undefined);
  }

  formatPaceOrderTable(title: string = "Pace Order") {
    const table = new AsciiTable3(title);

    if (isDoubleFile(this._paceMode)) {
      return table
        .setHeading("Row", "Line", "Car Number", "Name")
        .addRowMatrix(
          this._orderData.map(({ row, line, carNumber, displayName }) => [
            row,
            nameForLineValue(line),
            carNumber,
            displayName,
          ])
        );
    } else {
      return table
        .setHeading("Row", "Car Number", "Name")
        .addRowMatrix(
          this._orderData.map(({ row, carNumber, displayName }) => [
            row,
            carNumber,
            displayName,
          ])
        );
    }
  }

  formatUnassignedTable(title: string = "Unassigned") {
    return new AsciiTable3(title)
      .setHeading("Car Number", "Name")
      .addRowMatrix(
        this._unassignedData.map(({ carNumber, displayName }) => [
          carNumber,
          displayName,
        ])
      );
  }
}

export default PaceOrderFormatter;
