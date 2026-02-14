import EventEmitter from "node:events";
import { TrackLocation } from "@iracing-data/telemetry-types";

export type TrackLocationEventMap = {
  change: {
    previousTrackLocation: TrackLocation;
    currentTrackLocation: TrackLocation;
    sessionTime: string;
  };
};

type Payload<E extends keyof TrackLocationEventMap> = TrackLocationEventMap[E];

export class TrackLocationEventEmitter extends EventEmitter {
  private previousTrackLocation: TrackLocation = TrackLocation.not_in_world;

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof TrackLocationEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof TrackLocationEventMap>(
    event: E,
    payload: Payload<E>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(trackLocation: TrackLocation, sessionTime: string) {
    if (this.previousTrackLocation !== trackLocation) {
      this.emit("change", {
        previousTrackLocation: this.previousTrackLocation,
        currentTrackLocation: trackLocation,
        sessionTime,
      });

      this.previousTrackLocation = trackLocation;
    }
  }
}
