import EventEmitter from "node:events";
import _ from "lodash";
import {
  isApproachingPits,
  isInPitStall,
  isNotInWorld,
  isOffTrack,
  isOnTrack,
  TrackLocation,
} from "@iracing-data/telemetry-types";

export type CarTrackLocationEventMap = {
  change: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
    carIndex: number;
  };
  offTrack: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
    carIndex: number;
  };
  inPitStall: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
    carIndex: number;
  };
  approachingPits: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
    carIndex: number;
  };
  onTrack: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
    carIndex: number;
  };
  notInWorld: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
    carIndex: number;
  };
};

type Payload<E extends keyof CarTrackLocationEventMap> =
  CarTrackLocationEventMap[E];

export class CarTrackLocationEventEmitter extends EventEmitter {
  private previousTrackLocations: TrackLocation[] = [];

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof CarTrackLocationEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof CarTrackLocationEventMap>(
    event: E,
    payload: Payload<E>
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(
    trackLocations: TrackLocation[],
    sessionTime: string,
    length: number = trackLocations.length
  ) {
    if (!_.isEqual(this.previousTrackLocations, trackLocations)) {
      for (let i = 0; i < length; i++) {
        const previousLocation = this.previousTrackLocations[i];
        const currentLocation = trackLocations[i];

        if (previousLocation !== currentLocation) {
          this.emit("change", {
            sessionTime,
            currentTrackLocation: currentLocation,
            previousTrackLocation: previousLocation,
            carIndex: i,
          });

          if (isNotInWorld(currentLocation)) {
            this.emit("notInWorld", {
              sessionTime,
              currentTrackLocation: currentLocation,
              previousTrackLocation: previousLocation,
              carIndex: i,
            });
          } else if (isOffTrack(currentLocation)) {
            this.emit("offTrack", {
              sessionTime,
              currentTrackLocation: currentLocation,
              previousTrackLocation: previousLocation,
              carIndex: i,
            });
          } else if (isInPitStall(currentLocation)) {
            this.emit("inPitStall", {
              sessionTime,
              currentTrackLocation: currentLocation,
              previousTrackLocation: previousLocation,
              carIndex: i,
            });
          } else if (isApproachingPits(currentLocation)) {
            this.emit("approachingPits", {
              sessionTime,
              currentTrackLocation: currentLocation,
              previousTrackLocation: previousLocation,
              carIndex: i,
            });
          } else if (isOnTrack(currentLocation)) {
            this.emit("onTrack", {
              sessionTime,
              currentTrackLocation: currentLocation,
              previousTrackLocation: previousLocation,
              carIndex: i,
            });
          }
        }
      }

      this.previousTrackLocations = trackLocations;
    }
  }
}

export default CarTrackLocationEventEmitter;
