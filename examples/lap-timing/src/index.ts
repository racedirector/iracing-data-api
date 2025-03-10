import { TelemetryVariable } from "@iracing-data/irsdk-node";

export class LapTiming {
  private sessionTick: TelemetryVariable;
  private lastLapTime: TelemetryVariable;
  private bestLapTime: TelemetryVariable;
  private bestLapNumber: TelemetryVariable;

  constructor() {
    this.sessionTick = TelemetryVariable("SessionTick");
    this.lastLapTime = TelemetryVariable("CarIdxLastLapTime");
    this.bestLapTime = TelemetryVariable("CarIdxBestLapTime");
    this.bestLapNumber = TelemetryVariable("CarIdxBestLapNum");
  }
}

export default LapTiming;
