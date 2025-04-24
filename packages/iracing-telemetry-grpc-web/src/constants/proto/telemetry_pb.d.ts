import * as jspb from 'google-protobuf'

import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb'; // proto import: "google/protobuf/struct.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class TelemetrySubscriptionRequest extends jspb.Message {
  getFps(): number;
  setFps(value: number): TelemetrySubscriptionRequest;

  getKeysList(): Array<string>;
  setKeysList(value: Array<string>): TelemetrySubscriptionRequest;
  clearKeysList(): TelemetrySubscriptionRequest;
  addKeys(value: string, index?: number): TelemetrySubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TelemetrySubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TelemetrySubscriptionRequest): TelemetrySubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: TelemetrySubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TelemetrySubscriptionRequest;
  static deserializeBinaryFromReader(message: TelemetrySubscriptionRequest, reader: jspb.BinaryReader): TelemetrySubscriptionRequest;
}

export namespace TelemetrySubscriptionRequest {
  export type AsObject = {
    fps: number,
    keysList: Array<string>,
  }
}

export class GetTelemetryRequest extends jspb.Message {
  getKeysList(): Array<string>;
  setKeysList(value: Array<string>): GetTelemetryRequest;
  clearKeysList(): GetTelemetryRequest;
  addKeys(value: string, index?: number): GetTelemetryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTelemetryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTelemetryRequest): GetTelemetryRequest.AsObject;
  static serializeBinaryToWriter(message: GetTelemetryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTelemetryRequest;
  static deserializeBinaryFromReader(message: GetTelemetryRequest, reader: jspb.BinaryReader): GetTelemetryRequest;
}

export namespace GetTelemetryRequest {
  export type AsObject = {
    keysList: Array<string>,
  }
}

export class GetTelemetryResponse extends jspb.Message {
  getTelemetry(): google_protobuf_struct_pb.Struct | undefined;
  setTelemetry(value?: google_protobuf_struct_pb.Struct): GetTelemetryResponse;
  hasTelemetry(): boolean;
  clearTelemetry(): GetTelemetryResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTelemetryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTelemetryResponse): GetTelemetryResponse.AsObject;
  static serializeBinaryToWriter(message: GetTelemetryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTelemetryResponse;
  static deserializeBinaryFromReader(message: GetTelemetryResponse, reader: jspb.BinaryReader): GetTelemetryResponse;
}

export namespace GetTelemetryResponse {
  export type AsObject = {
    telemetry?: google_protobuf_struct_pb.Struct.AsObject,
  }
}

export class GetTelemetryStringResponse extends jspb.Message {
  getTelemetry(): string;
  setTelemetry(value: string): GetTelemetryStringResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTelemetryStringResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTelemetryStringResponse): GetTelemetryStringResponse.AsObject;
  static serializeBinaryToWriter(message: GetTelemetryStringResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTelemetryStringResponse;
  static deserializeBinaryFromReader(message: GetTelemetryStringResponse, reader: jspb.BinaryReader): GetTelemetryStringResponse;
}

export namespace GetTelemetryStringResponse {
  export type AsObject = {
    telemetry: string,
  }
}

