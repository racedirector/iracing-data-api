import EventEmitter from "node:events";
import { SessionState } from "@iracing-data/telemetry-types";

export type SessionStateEventMap = {
  change: {
    previousSessionState: SessionState;
    currentSessionState: SessionState;
    sessionTime: string;
  };
};

type Payload<E extends keyof SessionStateEventMap> = SessionStateEventMap[E];

export class SessionStateEventEmitter extends EventEmitter {
  private previousSessionState: SessionState = SessionState.invalid;

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof SessionStateEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof SessionStateEventMap>(
    event: E,
    payload: Payload<E>
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(sessionState: SessionState, sessionTime: string) {
    if (this.previousSessionState !== sessionState) {
      this.emit("change", {
        previousSessionState: this.previousSessionState,
        currentSessionState: sessionState,
        sessionTime,
      });

      this.previousSessionState = sessionState;
    }
  }
}
