import { Session } from "./session";
import {
  Flags,
  PaceFlags,
  PaceMode,
  PitServiceStatus,
  SessionState,
  Telemetry,
  TrackLocation,
} from "./telemetry";

export * from "./telemetry";
export * from "./session";

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

// Pace Mode
export const isSingleFileRestart = (mode: number) =>
  !!(mode & PaceMode.single_file_restart);
export const isSingleFileStart = (mode: number) =>
  !!(mode & PaceMode.single_file_start);
export const isDoubleFileRestart = (mode: number) =>
  !!(mode & PaceMode.double_file_restart);
export const isDoubleFileStart = (mode: number) =>
  !!(mode & PaceMode.double_file_start);
export const isNotPacing = (mode: number) => !!(mode & PaceMode.not_pacing);
export const isSingleFile = (mode: number) =>
  isSingleFileRestart(mode) || isSingleFileStart(mode);
export const isDoubleFile = (mode: number) =>
  isDoubleFileRestart(mode) || isDoubleFileStart(mode);
export const isRaceStart = (mode: number) =>
  isSingleFileStart(mode) || isDoubleFileStart(mode);
export const isRestart = (mode: number) =>
  isSingleFileRestart(mode) || isDoubleFileRestart(mode);

// Pace line
export const isLeftLine = (value: number) => value === 0;
export const isRightLine = (value: number) => value === 1;
export const isNoLine = (value: number) => value === -1;

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

// Track Location
export const isOnTrack = (location: number) =>
  location === TrackLocation.on_track;
export const isOffTrack = (location: number) =>
  location === TrackLocation.off_track;
export const isApproachingPits = (location: number) =>
  location === TrackLocation.aproaching_pits;
export const isInPitStall = (location: number) =>
  location === TrackLocation.in_pit_stall;
export const isNotInWorld = (location: number) =>
  location === TrackLocation.not_in_world;

export const isOnPitRoad = (location: number) =>
  isApproachingPits(location) || isInPitStall(location);

export const didLeaveWorld = (
  previousLocation: number,
  currentLocation: number,
) =>
  previousLocation > TrackLocation.not_in_world &&
  isNotInWorld(currentLocation);

export const didReturnToWorld = (
  previousLocation: number,
  currentLocation: number,
) =>
  isNotInWorld(previousLocation) &&
  currentLocation > TrackLocation.not_in_world;

export const didReturnToLocation = (
  previousLocation: number,
  currentLocation: number,
  location: TrackLocation,
) => isNotInWorld(previousLocation) && currentLocation === location;

// Session State
export const isInvalid = (state: number) => state === SessionState.invalid;
export const isGetInCar = (state: number) => state === SessionState.get_in_car;
export const isWarmup = (state: number) => state === SessionState.warmup;
export const isParadeLap = (state: number) =>
  state === SessionState.parade_laps;
export const isRacing = (state: number) => state === SessionState.racing;
export const isCheckeredState = (state: number) =>
  state === SessionState.checkered;
export const isCoolDown = (state: number) => state === SessionState.cool_down;
