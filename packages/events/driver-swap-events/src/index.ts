import { EventEmitter } from "node:events";
import { Session } from "@iracing-data/telemetry-types";

type Drivers = Session["DriverInfo"]["Drivers"];
type Driver = Drivers[number];

export type DriverSwapEventMap = {
  change: {
    previousDriver: Driver;
    currentDriver: Driver;
    sessionTime: string;
  };
};

type Payload<E extends keyof DriverSwapEventMap> = DriverSwapEventMap[E];

export class DriverSwapEventEmitter extends EventEmitter {
  private previousDrivers: Drivers = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof DriverSwapEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof DriverSwapEventMap>(
    event: E,
    payload: Payload<E>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  async process(
    drivers: Drivers,
    sessionTime: string,
    length: number = drivers.length,
  ) {
    if (this.previousDrivers.length === 0) {
      this.previousDrivers = drivers;
      return;
    }

    for (let i = 0; i < length; i++) {
      const previousDriver = this.previousDrivers[i];
      const currentDriver = drivers[i];

      if (previousDriver.UserID !== currentDriver.UserID) {
        this.emit("change", {
          previousDriver,
          currentDriver,
          sessionTime,
        });
      }
    }
  }
}

export default DriverSwapEventEmitter;
