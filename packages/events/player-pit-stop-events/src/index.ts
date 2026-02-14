import EventEmitter from "node:events";
import {
  PitServiceFlags,
  PitServiceStatus,
  TrackLocation,
} from "@iracing-data/telemetry-types";

export type PlayerPitStopEventMap = {
  /** Fired when a car enters pit road. */
  "pitroad:entered": {
    sessionTime: string;
    isPitLaneOpen: boolean;
  };
  /** Fired when a car exits pit road. */
  "pitroad:exited": {
    sessionTime: string;
    isPitLaneOpen: boolean;
  };
  "pitstall:entered": {
    sessionTime: string;
    trackLocation: TrackLocation;
    requestedService: PitServiceFlags | 0;
  };
  "pitstall:exited": {
    sessionTime: string;
    trackLocation: TrackLocation;
  };
  "service:start": {
    sessionTime: string;
  };
  "service:end": {
    sessionTime: string;
  };
  "service:update": {
    sessionTime: string;
    previousServiceFlags: PitServiceFlags | 0;
    currentServiceFlags: PitServiceFlags | 0;
    isPitstopActive: boolean;
  };
  "service:change": {
    sessionTime: string;
    previousServiceStatus: PitServiceStatus;
    currentServiceStatus: PitServiceStatus;
  };
};

type Payload<E extends keyof PlayerPitStopEventMap> = PlayerPitStopEventMap[E];

interface PitStopEventInput {
  isOnPitRoad: boolean;
  isPitLaneOpen: boolean;
  isPlayerCarInPitStall: boolean;
  isPitstopActive: boolean;
  serviceFlags: PitServiceFlags | 0;
  trackLocation: TrackLocation;
  serviceStatus: PitServiceStatus;
  sessionTime: string;
  optionalRepairsRemaining?: number;
}

export class PlayerPitStopEventEmitter extends EventEmitter {
  private previousIsOnPitRoad: boolean = false;
  private previousIsPlayerCarInPitStall: boolean = false;
  private previousIsPitstopActive: boolean = false;
  private previousPitServiceStatus: PitServiceStatus = PitServiceStatus.none;
  private previousPitServiceFlags: PitServiceFlags | 0 = 0;

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof PlayerPitStopEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof PlayerPitStopEventMap>(
    event: E,
    payload: Payload<E>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process({
    isPitLaneOpen,
    isPlayerCarInPitStall,
    isPitstopActive,
    isOnPitRoad,
    serviceFlags,
    trackLocation,
    serviceStatus,
    sessionTime,
  }: PitStopEventInput) {
    if (this.previousIsOnPitRoad !== isOnPitRoad) {
      this.emit(`pitroad:${isOnPitRoad ? "entered" : "exited"}`, {
        sessionTime,
        isPitLaneOpen,
      });

      this.previousIsOnPitRoad = isOnPitRoad;
    }

    if (this.previousIsPlayerCarInPitStall !== isPlayerCarInPitStall) {
      this.emit(`pitstall:${isPlayerCarInPitStall ? "entered" : "exited"}`, {
        sessionTime,
        trackLocation,
        requestedService: serviceFlags,
      });

      this.previousIsPlayerCarInPitStall = isPlayerCarInPitStall;
    }

    if (this.previousIsPitstopActive !== isPitstopActive) {
      this.emit(`service:${isPitstopActive ? "start" : "end"}`, {
        sessionTime,
      });

      this.previousIsPitstopActive = isPitstopActive;
    }

    if (this.previousPitServiceStatus !== serviceStatus) {
      this.emit("service:change", {
        sessionTime,
        previousServiceStatus: this.previousPitServiceStatus,
        currentServiceStatus: serviceStatus,
      });

      this.previousPitServiceStatus = serviceStatus;
    }

    if (this.previousPitServiceFlags !== serviceFlags) {
      this.emit("service:update", {
        sessionTime,
        previousServiceFlags: this.previousPitServiceFlags,
        currentServiceFlags: serviceFlags,
        isPitstopActive,
      });

      this.previousPitServiceFlags = serviceFlags;
    }
  }
}

export default PlayerPitStopEventEmitter;
