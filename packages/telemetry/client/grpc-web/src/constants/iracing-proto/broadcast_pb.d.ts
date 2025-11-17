import * as jspb from 'google-protobuf'

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class CameraSwitchPositionRequest extends jspb.Message {
  getPosition(): number;
  setPosition(value: number): CameraSwitchPositionRequest;
  hasPosition(): boolean;
  clearPosition(): CameraSwitchPositionRequest;

  getGroup(): number;
  setGroup(value: number): CameraSwitchPositionRequest;
  hasGroup(): boolean;
  clearGroup(): CameraSwitchPositionRequest;

  getCamera(): number;
  setCamera(value: number): CameraSwitchPositionRequest;
  hasCamera(): boolean;
  clearCamera(): CameraSwitchPositionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraSwitchPositionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CameraSwitchPositionRequest): CameraSwitchPositionRequest.AsObject;
  static serializeBinaryToWriter(message: CameraSwitchPositionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraSwitchPositionRequest;
  static deserializeBinaryFromReader(message: CameraSwitchPositionRequest, reader: jspb.BinaryReader): CameraSwitchPositionRequest;
}

export namespace CameraSwitchPositionRequest {
  export type AsObject = {
    position?: number,
    group?: number,
    camera?: number,
  }

  export enum PositionCase { 
    _POSITION_NOT_SET = 0,
    POSITION = 1,
  }

  export enum GroupCase { 
    _GROUP_NOT_SET = 0,
    GROUP = 2,
  }

  export enum CameraCase { 
    _CAMERA_NOT_SET = 0,
    CAMERA = 3,
  }
}

export class CameraSwitchPositionResponse extends jspb.Message {
  getCarIndex(): number;
  setCarIndex(value: number): CameraSwitchPositionResponse;

  getGroup(): number;
  setGroup(value: number): CameraSwitchPositionResponse;

  getCamera(): number;
  setCamera(value: number): CameraSwitchPositionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraSwitchPositionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CameraSwitchPositionResponse): CameraSwitchPositionResponse.AsObject;
  static serializeBinaryToWriter(message: CameraSwitchPositionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraSwitchPositionResponse;
  static deserializeBinaryFromReader(message: CameraSwitchPositionResponse, reader: jspb.BinaryReader): CameraSwitchPositionResponse;
}

export namespace CameraSwitchPositionResponse {
  export type AsObject = {
    carIndex: number,
    group: number,
    camera: number,
  }
}

export class CameraSwitchNumberRequest extends jspb.Message {
  getCarNumber(): string;
  setCarNumber(value: string): CameraSwitchNumberRequest;
  hasCarNumber(): boolean;
  clearCarNumber(): CameraSwitchNumberRequest;

  getGroup(): number;
  setGroup(value: number): CameraSwitchNumberRequest;
  hasGroup(): boolean;
  clearGroup(): CameraSwitchNumberRequest;

  getCamera(): number;
  setCamera(value: number): CameraSwitchNumberRequest;
  hasCamera(): boolean;
  clearCamera(): CameraSwitchNumberRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraSwitchNumberRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CameraSwitchNumberRequest): CameraSwitchNumberRequest.AsObject;
  static serializeBinaryToWriter(message: CameraSwitchNumberRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraSwitchNumberRequest;
  static deserializeBinaryFromReader(message: CameraSwitchNumberRequest, reader: jspb.BinaryReader): CameraSwitchNumberRequest;
}

export namespace CameraSwitchNumberRequest {
  export type AsObject = {
    carNumber?: string,
    group?: number,
    camera?: number,
  }

  export enum CarNumberCase { 
    _CAR_NUMBER_NOT_SET = 0,
    CAR_NUMBER = 1,
  }

  export enum GroupCase { 
    _GROUP_NOT_SET = 0,
    GROUP = 2,
  }

  export enum CameraCase { 
    _CAMERA_NOT_SET = 0,
    CAMERA = 3,
  }
}

export class CameraSwitchNumberResponse extends jspb.Message {
  getCarIndex(): number;
  setCarIndex(value: number): CameraSwitchNumberResponse;

  getGroup(): number;
  setGroup(value: number): CameraSwitchNumberResponse;

  getCamera(): number;
  setCamera(value: number): CameraSwitchNumberResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraSwitchNumberResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CameraSwitchNumberResponse): CameraSwitchNumberResponse.AsObject;
  static serializeBinaryToWriter(message: CameraSwitchNumberResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraSwitchNumberResponse;
  static deserializeBinaryFromReader(message: CameraSwitchNumberResponse, reader: jspb.BinaryReader): CameraSwitchNumberResponse;
}

export namespace CameraSwitchNumberResponse {
  export type AsObject = {
    carIndex: number,
    group: number,
    camera: number,
  }
}

export class CameraSetStateRequest extends jspb.Message {
  getState(): CameraState;
  setState(value: CameraState): CameraSetStateRequest;
  hasState(): boolean;
  clearState(): CameraSetStateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraSetStateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CameraSetStateRequest): CameraSetStateRequest.AsObject;
  static serializeBinaryToWriter(message: CameraSetStateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraSetStateRequest;
  static deserializeBinaryFromReader(message: CameraSetStateRequest, reader: jspb.BinaryReader): CameraSetStateRequest;
}

export namespace CameraSetStateRequest {
  export type AsObject = {
    state?: CameraState,
  }

  export enum StateCase { 
    _STATE_NOT_SET = 0,
    STATE = 1,
  }
}

export class CameraSetStateResponse extends jspb.Message {
  getState(): CameraState;
  setState(value: CameraState): CameraSetStateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraSetStateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CameraSetStateResponse): CameraSetStateResponse.AsObject;
  static serializeBinaryToWriter(message: CameraSetStateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraSetStateResponse;
  static deserializeBinaryFromReader(message: CameraSetStateResponse, reader: jspb.BinaryReader): CameraSetStateResponse;
}

export namespace CameraSetStateResponse {
  export type AsObject = {
    state: CameraState,
  }
}

export class ReplaySetPlaySpeedRequest extends jspb.Message {
  getSpeed(): number;
  setSpeed(value: number): ReplaySetPlaySpeedRequest;
  hasSpeed(): boolean;
  clearSpeed(): ReplaySetPlaySpeedRequest;

  getIsSlowMotion(): boolean;
  setIsSlowMotion(value: boolean): ReplaySetPlaySpeedRequest;
  hasIsSlowMotion(): boolean;
  clearIsSlowMotion(): ReplaySetPlaySpeedRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySetPlaySpeedRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySetPlaySpeedRequest): ReplaySetPlaySpeedRequest.AsObject;
  static serializeBinaryToWriter(message: ReplaySetPlaySpeedRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySetPlaySpeedRequest;
  static deserializeBinaryFromReader(message: ReplaySetPlaySpeedRequest, reader: jspb.BinaryReader): ReplaySetPlaySpeedRequest;
}

export namespace ReplaySetPlaySpeedRequest {
  export type AsObject = {
    speed?: number,
    isSlowMotion?: boolean,
  }

  export enum SpeedCase { 
    _SPEED_NOT_SET = 0,
    SPEED = 1,
  }

  export enum IsSlowMotionCase { 
    _IS_SLOW_MOTION_NOT_SET = 0,
    IS_SLOW_MOTION = 2,
  }
}

export class ReplaySetPlaySpeedResponse extends jspb.Message {
  getSpeed(): number;
  setSpeed(value: number): ReplaySetPlaySpeedResponse;

  getIsSlowMotion(): boolean;
  setIsSlowMotion(value: boolean): ReplaySetPlaySpeedResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySetPlaySpeedResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySetPlaySpeedResponse): ReplaySetPlaySpeedResponse.AsObject;
  static serializeBinaryToWriter(message: ReplaySetPlaySpeedResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySetPlaySpeedResponse;
  static deserializeBinaryFromReader(message: ReplaySetPlaySpeedResponse, reader: jspb.BinaryReader): ReplaySetPlaySpeedResponse;
}

export namespace ReplaySetPlaySpeedResponse {
  export type AsObject = {
    speed: number,
    isSlowMotion: boolean,
  }
}

export class ReplaySetPlayPositionRequest extends jspb.Message {
  getMode(): ReplayPositionMode;
  setMode(value: ReplayPositionMode): ReplaySetPlayPositionRequest;
  hasMode(): boolean;
  clearMode(): ReplaySetPlayPositionRequest;

  getFrame(): number;
  setFrame(value: number): ReplaySetPlayPositionRequest;
  hasFrame(): boolean;
  clearFrame(): ReplaySetPlayPositionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySetPlayPositionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySetPlayPositionRequest): ReplaySetPlayPositionRequest.AsObject;
  static serializeBinaryToWriter(message: ReplaySetPlayPositionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySetPlayPositionRequest;
  static deserializeBinaryFromReader(message: ReplaySetPlayPositionRequest, reader: jspb.BinaryReader): ReplaySetPlayPositionRequest;
}

export namespace ReplaySetPlayPositionRequest {
  export type AsObject = {
    mode?: ReplayPositionMode,
    frame?: number,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }

  export enum FrameCase { 
    _FRAME_NOT_SET = 0,
    FRAME = 2,
  }
}

export class ReplaySetPlayPositionResponse extends jspb.Message {
  getFrame(): number;
  setFrame(value: number): ReplaySetPlayPositionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySetPlayPositionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySetPlayPositionResponse): ReplaySetPlayPositionResponse.AsObject;
  static serializeBinaryToWriter(message: ReplaySetPlayPositionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySetPlayPositionResponse;
  static deserializeBinaryFromReader(message: ReplaySetPlayPositionResponse, reader: jspb.BinaryReader): ReplaySetPlayPositionResponse;
}

export namespace ReplaySetPlayPositionResponse {
  export type AsObject = {
    frame: number,
  }
}

export class ReplaySearchRequest extends jspb.Message {
  getMode(): ReplaySearchMode;
  setMode(value: ReplaySearchMode): ReplaySearchRequest;
  hasMode(): boolean;
  clearMode(): ReplaySearchRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySearchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySearchRequest): ReplaySearchRequest.AsObject;
  static serializeBinaryToWriter(message: ReplaySearchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySearchRequest;
  static deserializeBinaryFromReader(message: ReplaySearchRequest, reader: jspb.BinaryReader): ReplaySearchRequest;
}

export namespace ReplaySearchRequest {
  export type AsObject = {
    mode?: ReplaySearchMode,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }
}

export class ReplaySearchResponse extends jspb.Message {
  getFrame(): number;
  setFrame(value: number): ReplaySearchResponse;

  getSessionNumber(): number;
  setSessionNumber(value: number): ReplaySearchResponse;

  getSessionTime(): number;
  setSessionTime(value: number): ReplaySearchResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySearchResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySearchResponse): ReplaySearchResponse.AsObject;
  static serializeBinaryToWriter(message: ReplaySearchResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySearchResponse;
  static deserializeBinaryFromReader(message: ReplaySearchResponse, reader: jspb.BinaryReader): ReplaySearchResponse;
}

export namespace ReplaySearchResponse {
  export type AsObject = {
    frame: number,
    sessionNumber: number,
    sessionTime: number,
  }
}

export class ReplaySetStateRequest extends jspb.Message {
  getState(): ReplayStateMode;
  setState(value: ReplayStateMode): ReplaySetStateRequest;
  hasState(): boolean;
  clearState(): ReplaySetStateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySetStateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySetStateRequest): ReplaySetStateRequest.AsObject;
  static serializeBinaryToWriter(message: ReplaySetStateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySetStateRequest;
  static deserializeBinaryFromReader(message: ReplaySetStateRequest, reader: jspb.BinaryReader): ReplaySetStateRequest;
}

export namespace ReplaySetStateRequest {
  export type AsObject = {
    state?: ReplayStateMode,
  }

  export enum StateCase { 
    _STATE_NOT_SET = 0,
    STATE = 1,
  }
}

export class ReplaySetStateResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySetStateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySetStateResponse): ReplaySetStateResponse.AsObject;
  static serializeBinaryToWriter(message: ReplaySetStateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySetStateResponse;
  static deserializeBinaryFromReader(message: ReplaySetStateResponse, reader: jspb.BinaryReader): ReplaySetStateResponse;
}

export namespace ReplaySetStateResponse {
  export type AsObject = {
  }
}

export class ReloadTexturesRequest extends jspb.Message {
  getCarIdx(): number;
  setCarIdx(value: number): ReloadTexturesRequest;
  hasCarIdx(): boolean;
  clearCarIdx(): ReloadTexturesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReloadTexturesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReloadTexturesRequest): ReloadTexturesRequest.AsObject;
  static serializeBinaryToWriter(message: ReloadTexturesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReloadTexturesRequest;
  static deserializeBinaryFromReader(message: ReloadTexturesRequest, reader: jspb.BinaryReader): ReloadTexturesRequest;
}

export namespace ReloadTexturesRequest {
  export type AsObject = {
    carIdx?: number,
  }

  export enum CarIdxCase { 
    _CAR_IDX_NOT_SET = 0,
    CAR_IDX = 1,
  }
}

export class ReloadTexturesResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReloadTexturesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReloadTexturesResponse): ReloadTexturesResponse.AsObject;
  static serializeBinaryToWriter(message: ReloadTexturesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReloadTexturesResponse;
  static deserializeBinaryFromReader(message: ReloadTexturesResponse, reader: jspb.BinaryReader): ReloadTexturesResponse;
}

export namespace ReloadTexturesResponse {
  export type AsObject = {
  }
}

export class ChatCommandRequest extends jspb.Message {
  getMode(): ChatCommandMode;
  setMode(value: ChatCommandMode): ChatCommandRequest;
  hasMode(): boolean;
  clearMode(): ChatCommandRequest;

  getMacro(): number;
  setMacro(value: number): ChatCommandRequest;
  hasMacro(): boolean;
  clearMacro(): ChatCommandRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatCommandRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChatCommandRequest): ChatCommandRequest.AsObject;
  static serializeBinaryToWriter(message: ChatCommandRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatCommandRequest;
  static deserializeBinaryFromReader(message: ChatCommandRequest, reader: jspb.BinaryReader): ChatCommandRequest;
}

export namespace ChatCommandRequest {
  export type AsObject = {
    mode?: ChatCommandMode,
    macro?: number,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }

  export enum MacroCase { 
    _MACRO_NOT_SET = 0,
    MACRO = 2,
  }
}

export class ChatCommandResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatCommandResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChatCommandResponse): ChatCommandResponse.AsObject;
  static serializeBinaryToWriter(message: ChatCommandResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatCommandResponse;
  static deserializeBinaryFromReader(message: ChatCommandResponse, reader: jspb.BinaryReader): ChatCommandResponse;
}

export namespace ChatCommandResponse {
  export type AsObject = {
  }
}

export class PitCommandRequest extends jspb.Message {
  getMode(): PitCommandMode;
  setMode(value: PitCommandMode): PitCommandRequest;
  hasMode(): boolean;
  clearMode(): PitCommandRequest;

  getValue(): number;
  setValue(value: number): PitCommandRequest;
  hasValue(): boolean;
  clearValue(): PitCommandRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PitCommandRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PitCommandRequest): PitCommandRequest.AsObject;
  static serializeBinaryToWriter(message: PitCommandRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PitCommandRequest;
  static deserializeBinaryFromReader(message: PitCommandRequest, reader: jspb.BinaryReader): PitCommandRequest;
}

export namespace PitCommandRequest {
  export type AsObject = {
    mode?: PitCommandMode,
    value?: number,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }

  export enum ValueCase { 
    _VALUE_NOT_SET = 0,
    VALUE = 2,
  }
}

export class PitCommandResponse extends jspb.Message {
  getServiceFlags(): number;
  setServiceFlags(value: number): PitCommandResponse;

  getFuel(): number;
  setFuel(value: number): PitCommandResponse;

  getLfPressure(): number;
  setLfPressure(value: number): PitCommandResponse;

  getRfPressure(): number;
  setRfPressure(value: number): PitCommandResponse;

  getLrPressure(): number;
  setLrPressure(value: number): PitCommandResponse;

  getRrPressure(): number;
  setRrPressure(value: number): PitCommandResponse;

  getTireCompound(): number;
  setTireCompound(value: number): PitCommandResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PitCommandResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PitCommandResponse): PitCommandResponse.AsObject;
  static serializeBinaryToWriter(message: PitCommandResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PitCommandResponse;
  static deserializeBinaryFromReader(message: PitCommandResponse, reader: jspb.BinaryReader): PitCommandResponse;
}

export namespace PitCommandResponse {
  export type AsObject = {
    serviceFlags: number,
    fuel: number,
    lfPressure: number,
    rfPressure: number,
    lrPressure: number,
    rrPressure: number,
    tireCompound: number,
  }
}

export class TelemetryCommandRequest extends jspb.Message {
  getMode(): TelemetryCommandMode;
  setMode(value: TelemetryCommandMode): TelemetryCommandRequest;
  hasMode(): boolean;
  clearMode(): TelemetryCommandRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TelemetryCommandRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TelemetryCommandRequest): TelemetryCommandRequest.AsObject;
  static serializeBinaryToWriter(message: TelemetryCommandRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TelemetryCommandRequest;
  static deserializeBinaryFromReader(message: TelemetryCommandRequest, reader: jspb.BinaryReader): TelemetryCommandRequest;
}

export namespace TelemetryCommandRequest {
  export type AsObject = {
    mode?: TelemetryCommandMode,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }
}

export class TelemetryCommandResponse extends jspb.Message {
  getIsDiskLoggingEnabled(): boolean;
  setIsDiskLoggingEnabled(value: boolean): TelemetryCommandResponse;

  getIsDiskLoggingActive(): boolean;
  setIsDiskLoggingActive(value: boolean): TelemetryCommandResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TelemetryCommandResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TelemetryCommandResponse): TelemetryCommandResponse.AsObject;
  static serializeBinaryToWriter(message: TelemetryCommandResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TelemetryCommandResponse;
  static deserializeBinaryFromReader(message: TelemetryCommandResponse, reader: jspb.BinaryReader): TelemetryCommandResponse;
}

export namespace TelemetryCommandResponse {
  export type AsObject = {
    isDiskLoggingEnabled: boolean,
    isDiskLoggingActive: boolean,
  }
}

export class ForceFeedbackCommandRequest extends jspb.Message {
  getMode(): ForceFeedbackCommandMode;
  setMode(value: ForceFeedbackCommandMode): ForceFeedbackCommandRequest;
  hasMode(): boolean;
  clearMode(): ForceFeedbackCommandRequest;

  getValue(): number;
  setValue(value: number): ForceFeedbackCommandRequest;
  hasValue(): boolean;
  clearValue(): ForceFeedbackCommandRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForceFeedbackCommandRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ForceFeedbackCommandRequest): ForceFeedbackCommandRequest.AsObject;
  static serializeBinaryToWriter(message: ForceFeedbackCommandRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForceFeedbackCommandRequest;
  static deserializeBinaryFromReader(message: ForceFeedbackCommandRequest, reader: jspb.BinaryReader): ForceFeedbackCommandRequest;
}

export namespace ForceFeedbackCommandRequest {
  export type AsObject = {
    mode?: ForceFeedbackCommandMode,
    value?: number,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }

  export enum ValueCase { 
    _VALUE_NOT_SET = 0,
    VALUE = 2,
  }
}

export class ForceFeedbackCommandResponse extends jspb.Message {
  getMaxForce(): number;
  setMaxForce(value: number): ForceFeedbackCommandResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForceFeedbackCommandResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ForceFeedbackCommandResponse): ForceFeedbackCommandResponse.AsObject;
  static serializeBinaryToWriter(message: ForceFeedbackCommandResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForceFeedbackCommandResponse;
  static deserializeBinaryFromReader(message: ForceFeedbackCommandResponse, reader: jspb.BinaryReader): ForceFeedbackCommandResponse;
}

export namespace ForceFeedbackCommandResponse {
  export type AsObject = {
    maxForce: number,
  }
}

export class ReplaySearchSessionTimeRequest extends jspb.Message {
  getSessionNumber(): number;
  setSessionNumber(value: number): ReplaySearchSessionTimeRequest;
  hasSessionNumber(): boolean;
  clearSessionNumber(): ReplaySearchSessionTimeRequest;

  getSessionTimeMs(): number;
  setSessionTimeMs(value: number): ReplaySearchSessionTimeRequest;
  hasSessionTimeMs(): boolean;
  clearSessionTimeMs(): ReplaySearchSessionTimeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySearchSessionTimeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySearchSessionTimeRequest): ReplaySearchSessionTimeRequest.AsObject;
  static serializeBinaryToWriter(message: ReplaySearchSessionTimeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySearchSessionTimeRequest;
  static deserializeBinaryFromReader(message: ReplaySearchSessionTimeRequest, reader: jspb.BinaryReader): ReplaySearchSessionTimeRequest;
}

export namespace ReplaySearchSessionTimeRequest {
  export type AsObject = {
    sessionNumber?: number,
    sessionTimeMs?: number,
  }

  export enum SessionNumberCase { 
    _SESSION_NUMBER_NOT_SET = 0,
    SESSION_NUMBER = 1,
  }

  export enum SessionTimeMsCase { 
    _SESSION_TIME_MS_NOT_SET = 0,
    SESSION_TIME_MS = 2,
  }
}

export class ReplaySearchSessionTimeResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplaySearchSessionTimeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReplaySearchSessionTimeResponse): ReplaySearchSessionTimeResponse.AsObject;
  static serializeBinaryToWriter(message: ReplaySearchSessionTimeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplaySearchSessionTimeResponse;
  static deserializeBinaryFromReader(message: ReplaySearchSessionTimeResponse, reader: jspb.BinaryReader): ReplaySearchSessionTimeResponse;
}

export namespace ReplaySearchSessionTimeResponse {
  export type AsObject = {
  }
}

export class VideoCaptureRequest extends jspb.Message {
  getMode(): VideoCaptureMode;
  setMode(value: VideoCaptureMode): VideoCaptureRequest;
  hasMode(): boolean;
  clearMode(): VideoCaptureRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VideoCaptureRequest.AsObject;
  static toObject(includeInstance: boolean, msg: VideoCaptureRequest): VideoCaptureRequest.AsObject;
  static serializeBinaryToWriter(message: VideoCaptureRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VideoCaptureRequest;
  static deserializeBinaryFromReader(message: VideoCaptureRequest, reader: jspb.BinaryReader): VideoCaptureRequest;
}

export namespace VideoCaptureRequest {
  export type AsObject = {
    mode?: VideoCaptureMode,
  }

  export enum ModeCase { 
    _MODE_NOT_SET = 0,
    MODE = 1,
  }
}

export class VideoCaptureResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VideoCaptureResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VideoCaptureResponse): VideoCaptureResponse.AsObject;
  static serializeBinaryToWriter(message: VideoCaptureResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VideoCaptureResponse;
  static deserializeBinaryFromReader(message: VideoCaptureResponse, reader: jspb.BinaryReader): VideoCaptureResponse;
}

export namespace VideoCaptureResponse {
  export type AsObject = {
  }
}

export class CameraDetail extends jspb.Message {
  getNumber(): number;
  setNumber(value: number): CameraDetail;
  hasNumber(): boolean;
  clearNumber(): CameraDetail;

  getName(): string;
  setName(value: string): CameraDetail;
  hasName(): boolean;
  clearName(): CameraDetail;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraDetail.AsObject;
  static toObject(includeInstance: boolean, msg: CameraDetail): CameraDetail.AsObject;
  static serializeBinaryToWriter(message: CameraDetail, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraDetail;
  static deserializeBinaryFromReader(message: CameraDetail, reader: jspb.BinaryReader): CameraDetail;
}

export namespace CameraDetail {
  export type AsObject = {
    number?: number,
    name?: string,
  }

  export enum NumberCase { 
    _NUMBER_NOT_SET = 0,
    NUMBER = 1,
  }

  export enum NameCase { 
    _NAME_NOT_SET = 0,
    NAME = 2,
  }
}

export class CameraGroup extends jspb.Message {
  getNumber(): number;
  setNumber(value: number): CameraGroup;

  getName(): string;
  setName(value: string): CameraGroup;

  getCamerasList(): Array<CameraDetail>;
  setCamerasList(value: Array<CameraDetail>): CameraGroup;
  clearCamerasList(): CameraGroup;
  addCameras(value?: CameraDetail, index?: number): CameraDetail;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CameraGroup.AsObject;
  static toObject(includeInstance: boolean, msg: CameraGroup): CameraGroup.AsObject;
  static serializeBinaryToWriter(message: CameraGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CameraGroup;
  static deserializeBinaryFromReader(message: CameraGroup, reader: jspb.BinaryReader): CameraGroup;
}

export namespace CameraGroup {
  export type AsObject = {
    number: number,
    name: string,
    camerasList: Array<CameraDetail.AsObject>,
  }
}

export class GetAvailableCamerasResponse extends jspb.Message {
  getCameraGroupsList(): Array<CameraGroup>;
  setCameraGroupsList(value: Array<CameraGroup>): GetAvailableCamerasResponse;
  clearCameraGroupsList(): GetAvailableCamerasResponse;
  addCameraGroups(value?: CameraGroup, index?: number): CameraGroup;

  getCarIndex(): number;
  setCarIndex(value: number): GetAvailableCamerasResponse;

  getGroup(): number;
  setGroup(value: number): GetAvailableCamerasResponse;

  getCamera(): number;
  setCamera(value: number): GetAvailableCamerasResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAvailableCamerasResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetAvailableCamerasResponse): GetAvailableCamerasResponse.AsObject;
  static serializeBinaryToWriter(message: GetAvailableCamerasResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAvailableCamerasResponse;
  static deserializeBinaryFromReader(message: GetAvailableCamerasResponse, reader: jspb.BinaryReader): GetAvailableCamerasResponse;
}

export namespace GetAvailableCamerasResponse {
  export type AsObject = {
    cameraGroupsList: Array<CameraGroup.AsObject>,
    carIndex: number,
    group: number,
    camera: number,
  }
}

export enum TelemetryCommandMode { 
  TELEMETRY_COMMAND_MODE_UNKNOWN = 0,
  TELEMETRY_COMMAND_MODE_STOP = 1,
  TELEMETRY_COMMAND_MODE_START = 2,
  TELEMETRY_COMMAND_MODE_RESTART = 3,
}
export enum ChatCommandMode { 
  CHAT_COMMAND_MODE_UNKNOWN = 0,
  CHAT_COMMAND_MODE_MACRO = 1,
  CHAT_COMMAND_MODE_BEGIN_CHAT = 2,
  CHAT_COMMAND_MODE_REPLY = 3,
  CHAT_COMMAND_MODE_CANCEL = 4,
}
export enum CameraState { 
  CAMERA_STATE_UNKNOWN = 0,
  CAMERA_STATE_CAMERA_TOOL_ACTIVE = 1,
  CAMERA_STATE_UI_HIDDEN = 2,
  CAMERA_STATE_USE_AUTO_SHOT_SELECTION = 3,
  CAMERA_STATE_USE_TEMPORARY_EDITS = 4,
  CAMERA_STATE_USE_KEY_ACCELERATION = 5,
  CAMERA_STATE_USE_KEY10X_ACCELERATION = 6,
  CAMERA_STATE_USE_MOUSE_AIM_MODE = 7,
}
export enum ReplayPositionMode { 
  REPLAY_POSITION_MODE_UNKNOWN = 0,
  REPLAY_POSITION_MODE_BEGIN = 1,
  REPLAY_POSITION_MODE_CURRENT = 2,
  REPLAY_POSITION_MODE_END = 3,
}
export enum ReplaySearchMode { 
  REPLAY_SEARCH_MODE_UNKNOWN = 0,
  REPLAY_SEARCH_MODE_TO_START = 1,
  REPLAY_SEARCH_MODE_TO_END = 2,
  REPLAY_SEARCH_MODE_PREVIOUS_SESSION = 3,
  REPLAY_SEARCH_MODE_NEXT_SESSION = 4,
  REPLAY_SEARCH_MODE_PREVIOUS_LAP = 5,
  REPLAY_SEARCH_MODE_NEXT_LAP = 6,
  REPLAY_SEARCH_MODE_PREVIOUS_FRAME = 7,
  REPLAY_SEARCH_MODE_NEXT_FRAME = 8,
  REPLAY_SEARCH_MODE_PREVIOUS_INCIDENT = 9,
  REPLAY_SEARCH_MODE_NEXT_INCIDENT = 10,
}
export enum PitCommandMode { 
  PIT_COMMAND_MODE_UNKNOWN = 0,
  PIT_COMMAND_MODE_CLEAR = 1,
  PIT_COMMAND_MODE_TEAR_OFF = 2,
  PIT_COMMAND_MODE_FUEL = 3,
  PIT_COMMAND_MODE_LF_TIRE = 4,
  PIT_COMMAND_MODE_RF_TIRE = 5,
  PIT_COMMAND_MODE_LR_TIRE = 6,
  PIT_COMMAND_MODE_RR_TIRE = 7,
  PIT_COMMAND_MODE_CLEAR_TIRES = 8,
  PIT_COMMAND_MODE_FAST_REPAIR = 9,
  PIT_COMMAND_MODE_CLEAR_TEAR_OFF = 10,
  PIT_COMMAND_MODE_CLEAR_FAST_REPAIR = 11,
  PIT_COMMAND_MODE_CLEAR_FUEL = 12,
}
export enum ReplayStateMode { 
  REPLAY_STATE_MODE_UNKNOWN = 0,
  REPLAY_STATE_MODE_ERASE_TAPE = 1,
}
export enum VideoCaptureMode { 
  VIDEO_CAPTURE_MODE_UNKNOWN = 0,
  VIDEO_CAPTURE_MODE_SCREENSHOT = 1,
  VIDEO_CAPTURE_MODE_START = 2,
  VIDEO_CAPTURE_MODE_STOP = 3,
  VIDEO_CAPTURE_MODE_TOGGLE = 4,
  VIDEO_CAPTURE_MODE_SHOW_TIMER = 5,
  VIDEO_CAPTURE_MODE_HIDE_TIMER = 6,
}
export enum ForceFeedbackCommandMode { 
  FORCE_FEEDBACK_COMMAND_MODE_UNKNOWN = 0,
  FORCE_FEEDBACK_COMMAND_MODE_MAX_FORCE = 1,
}
