import { Session } from "./session";
import { Flags, PaceFlags, PitServiceStatus, Telemetry } from "./telemetry";

export type TelemetryData = Telemetry & Partial<Session>;
export type TelemetryKey = keyof TelemetryData;
export type TelemetryValue<K extends TelemetryKey = TelemetryKey> =
  TelemetryData[K];

// Flags
export const isCheckered = (flags: number) => !!(flags & Flags.checkered);
export const isWhite = (flags: number) => !!(flags & Flags.white);
export const isGreen = (flags: number) => !!(flags & Flags.green);
export const isYellow = (flags: number) => !!(flags & Flags.yellow);
export const isRed = (flags: number) => !!(flags & Flags.red);
export const isBlack = (flags: number) => !!(flags & Flags.black);
export const isBlue = (flags: number) => !!(flags & Flags.blue);
export const isDebris = (flags: number) => !!(flags & Flags.debris);
export const isCrossed = (flags: number) => !!(flags & Flags.crossed);
export const isYellowWaving = (flags: number) =>
  !!(flags & Flags.yellow_waving);
export const isOneToGreen = (flags: number) =>
  !!(flags & Flags.one_lap_to_green);
export const isGreenHeld = (flags: number) => !!(flags & Flags.green_held);
export const isTenToGo = (flags: number) => !!(flags & Flags.ten_to_go);
export const isFiveToGo = (flags: number) => !!(flags & Flags.five_to_go);
export const isRandomWaving = (flags: number) =>
  !!(flags & Flags.random_waving);
export const isCaution = (flags: number) => !!(flags & Flags.caution);
export const isCautionWaving = (flags: number) =>
  !!(flags & Flags.caution_waving);
export const isDisqualify = (flags: number) => !!(flags & Flags.disqualify);
export const isServicible = (flags: number) => !!(flags & Flags.servicible);
export const isFurled = (flags: number) => !!(flags & Flags.furled);
export const isRepair = (flags: number) => !!(flags & Flags.repair);
export const isStartHidden = (flags: number) => !!(flags & Flags.start_hidden);
export const isStartReady = (flags: number) => !!(flags & Flags.start_ready);
export const isStartSet = (flags: number) => !!(flags & Flags.start_set);
export const isStartGo = (flags: number) => !!(flags & Flags.start_go);

// Pace Flags
export const isEndOfLine = (flags: number) => !!(flags & PaceFlags.end_of_line);
export const isFreePass = (flags: number) => !!(flags & PaceFlags.free_pass);
export const isWavedAround = (flags: number) =>
  !!(flags & PaceFlags.waved_around);

// Pit Service Status
export const isNone = (status: number) => !!(status & PitServiceStatus.none);
export const isInProgress = (status: number) =>
  !!(status & PitServiceStatus.in_progress);
export const isComplete = (status: number) =>
  !!(status & PitServiceStatus.complete);
export const isTooFarLeft = (status: number) =>
  !!(status & PitServiceStatus.too_far_left);
export const isTooFarRight = (status: number) =>
  !!(status & PitServiceStatus.too_far_right);
export const isTooFarForward = (status: number) =>
  !!(status & PitServiceStatus.too_far_forward);
export const isTooFarBackward = (status: number) =>
  !!(status & PitServiceStatus.too_far_back);
export const isBadAngle = (status: number) =>
  !!(status & PitServiceStatus.bad_angle);
export const isTooMuchDamage = (status: number) =>
  !!(status & PitServiceStatus.cant_fix_that);
