import { EventEmitter } from "node:events";
import {
  Flags,
  isCaution,
  isCautionWaving,
  isCheckered,
  isCrossed,
  isFiveToGo,
  isGreen,
  isGreenHeld,
  isOneToGreen,
  isRandomWaving,
  isRed,
  isStartGo,
  isStartHidden,
  isStartReady,
  isStartSet,
  isTenToGo,
  isWhite,
  isYellow,
  isYellowWaving,
} from "@iracing-data/telemetry-types";

type SessionFlagEventPayload = {
  sessionTime: string;
  flags: Flags;
  previousFlags: Flags;
};

export type SessionFlagEventMap = {
  changed: SessionFlagEventPayload;
  checkered: SessionFlagEventPayload;
  white: SessionFlagEventPayload;
  green: SessionFlagEventPayload;
  red: SessionFlagEventPayload;
  yellow: SessionFlagEventPayload;
  crossed: SessionFlagEventPayload;
  yellowWaving: SessionFlagEventPayload;
  oneToGreen: SessionFlagEventPayload;
  greenHeld: SessionFlagEventPayload;
  tenToGo: SessionFlagEventPayload;
  fiveToGo: SessionFlagEventPayload;
  randomWaving: SessionFlagEventPayload;
  caution: SessionFlagEventPayload;
  cautionWaving: SessionFlagEventPayload;
  startHidden: SessionFlagEventPayload;
  startReady: SessionFlagEventPayload;
  startSet: SessionFlagEventPayload;
  startGo: SessionFlagEventPayload;
};

type Payload<E extends keyof SessionFlagEventMap> = SessionFlagEventMap[E];

export class SessionFlagEventEmitter extends EventEmitter {
  private previousSessionFlags = 0x0;

  // Typed helpers for safer .on/.emit usage
  on<E extends keyof SessionFlagEventMap>(
    event: E,
    listener: (payload: Payload<E>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.on(event, listener as any);
  }

  emit<E extends keyof SessionFlagEventMap>(
    event: E,
    payload: Payload<E>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.emit(event, payload as any);
  }

  process(sessionFlags: Flags, sessionTime: string) {
    if (this.previousSessionFlags !== sessionFlags) {
      // Emit the "changed" event on any detected change
      this.emit("changed", {
        sessionTime,
        previousFlags: this.previousSessionFlags,
        flags: sessionFlags,
      });

      if (
        isCheckered(sessionFlags) &&
        !isCheckered(this.previousSessionFlags)
      ) {
        this.emit("checkered", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isWhite(sessionFlags) && !isWhite(this.previousSessionFlags)) {
        this.emit("white", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isGreen(sessionFlags) && !isGreen(this.previousSessionFlags)) {
        this.emit("green", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isRed(sessionFlags) && !isRed(this.previousSessionFlags)) {
        this.emit("red", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isYellow(sessionFlags) && !isYellow(this.previousSessionFlags)) {
        this.emit("yellow", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isCrossed(sessionFlags) && !isCrossed(this.previousSessionFlags)) {
        this.emit("crossed", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isYellowWaving(sessionFlags) &&
        !isYellowWaving(this.previousSessionFlags)
      ) {
        this.emit("yellowWaving", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isOneToGreen(sessionFlags) &&
        !isOneToGreen(this.previousSessionFlags)
      ) {
        this.emit("oneToGreen", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isGreenHeld(sessionFlags) &&
        !isGreenHeld(this.previousSessionFlags)
      ) {
        this.emit("greenHeld", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isTenToGo(sessionFlags) && !isTenToGo(this.previousSessionFlags)) {
        this.emit("tenToGo", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isFiveToGo(sessionFlags) && !isFiveToGo(this.previousSessionFlags)) {
        this.emit("fiveToGo", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isRandomWaving(sessionFlags) &&
        !isRandomWaving(this.previousSessionFlags)
      ) {
        this.emit("randomWaving", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isCaution(sessionFlags) && !isCaution(this.previousSessionFlags)) {
        this.emit("caution", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isCautionWaving(sessionFlags) &&
        !isCautionWaving(this.previousSessionFlags)
      ) {
        this.emit("cautionWaving", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isStartHidden(sessionFlags) &&
        !isStartHidden(this.previousSessionFlags)
      ) {
        this.emit("startHidden", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (
        isStartReady(sessionFlags) &&
        !isStartReady(this.previousSessionFlags)
      ) {
        this.emit("startReady", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isStartSet(sessionFlags) && !isStartSet(this.previousSessionFlags)) {
        this.emit("startSet", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      if (isStartGo(sessionFlags) && !isStartGo(this.previousSessionFlags)) {
        this.emit("startGo", {
          sessionTime,
          previousFlags: this.previousSessionFlags,
          flags: sessionFlags,
        });
      }

      this.previousSessionFlags = sessionFlags;
    }
  }
}

export default SessionFlagEventEmitter;
