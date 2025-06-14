/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 5.29.3
 * source: proto/schema.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
import * as dependency_1 from "./../google/protobuf/struct";
import * as pb_1 from "google-protobuf";
import * as grpc_1 from "@grpc/grpc-js";
export namespace iracing.telemetry {
    export class GetTelemetryTypesRequest extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {}) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") { }
        }
        static fromObject(data: {}): GetTelemetryTypesRequest {
            const message = new GetTelemetryTypesRequest({});
            return message;
        }
        toObject() {
            const data: {} = {};
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GetTelemetryTypesRequest {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GetTelemetryTypesRequest();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): GetTelemetryTypesRequest {
            return GetTelemetryTypesRequest.deserialize(bytes);
        }
    }
    export class GetTelemetryTypesResponse extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {
            types?: dependency_1.google.protobuf.Struct;
        }) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") {
                if ("types" in data && data.types != undefined) {
                    this.types = data.types;
                }
            }
        }
        get types() {
            return pb_1.Message.getWrapperField(this, dependency_1.google.protobuf.Struct, 1) as dependency_1.google.protobuf.Struct;
        }
        set types(value: dependency_1.google.protobuf.Struct) {
            pb_1.Message.setWrapperField(this, 1, value);
        }
        get has_types() {
            return pb_1.Message.getField(this, 1) != null;
        }
        static fromObject(data: {
            types?: ReturnType<typeof dependency_1.google.protobuf.Struct.prototype.toObject>;
        }): GetTelemetryTypesResponse {
            const message = new GetTelemetryTypesResponse({});
            if (data.types != null) {
                message.types = dependency_1.google.protobuf.Struct.fromObject(data.types);
            }
            return message;
        }
        toObject() {
            const data: {
                types?: ReturnType<typeof dependency_1.google.protobuf.Struct.prototype.toObject>;
            } = {};
            if (this.types != null) {
                data.types = this.types.toObject();
            }
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (this.has_types)
                writer.writeMessage(1, this.types, () => this.types.serialize(writer));
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GetTelemetryTypesResponse {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GetTelemetryTypesResponse();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    case 1:
                        reader.readMessage(message.types, () => message.types = dependency_1.google.protobuf.Struct.deserialize(reader));
                        break;
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): GetTelemetryTypesResponse {
            return GetTelemetryTypesResponse.deserialize(bytes);
        }
    }
    export class GetTelemetryJSONSchemaRequest extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {}) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") { }
        }
        static fromObject(data: {}): GetTelemetryJSONSchemaRequest {
            const message = new GetTelemetryJSONSchemaRequest({});
            return message;
        }
        toObject() {
            const data: {} = {};
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GetTelemetryJSONSchemaRequest {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GetTelemetryJSONSchemaRequest();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): GetTelemetryJSONSchemaRequest {
            return GetTelemetryJSONSchemaRequest.deserialize(bytes);
        }
    }
    export class GetTelemetryJSONSchemaResponse extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {
            telemetry?: dependency_1.google.protobuf.Struct;
            session?: dependency_1.google.protobuf.Struct;
        }) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") {
                if ("telemetry" in data && data.telemetry != undefined) {
                    this.telemetry = data.telemetry;
                }
                if ("session" in data && data.session != undefined) {
                    this.session = data.session;
                }
            }
        }
        get telemetry() {
            return pb_1.Message.getWrapperField(this, dependency_1.google.protobuf.Struct, 1) as dependency_1.google.protobuf.Struct;
        }
        set telemetry(value: dependency_1.google.protobuf.Struct) {
            pb_1.Message.setWrapperField(this, 1, value);
        }
        get has_telemetry() {
            return pb_1.Message.getField(this, 1) != null;
        }
        get session() {
            return pb_1.Message.getWrapperField(this, dependency_1.google.protobuf.Struct, 2) as dependency_1.google.protobuf.Struct;
        }
        set session(value: dependency_1.google.protobuf.Struct) {
            pb_1.Message.setWrapperField(this, 2, value);
        }
        get has_session() {
            return pb_1.Message.getField(this, 2) != null;
        }
        static fromObject(data: {
            telemetry?: ReturnType<typeof dependency_1.google.protobuf.Struct.prototype.toObject>;
            session?: ReturnType<typeof dependency_1.google.protobuf.Struct.prototype.toObject>;
        }): GetTelemetryJSONSchemaResponse {
            const message = new GetTelemetryJSONSchemaResponse({});
            if (data.telemetry != null) {
                message.telemetry = dependency_1.google.protobuf.Struct.fromObject(data.telemetry);
            }
            if (data.session != null) {
                message.session = dependency_1.google.protobuf.Struct.fromObject(data.session);
            }
            return message;
        }
        toObject() {
            const data: {
                telemetry?: ReturnType<typeof dependency_1.google.protobuf.Struct.prototype.toObject>;
                session?: ReturnType<typeof dependency_1.google.protobuf.Struct.prototype.toObject>;
            } = {};
            if (this.telemetry != null) {
                data.telemetry = this.telemetry.toObject();
            }
            if (this.session != null) {
                data.session = this.session.toObject();
            }
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (this.has_telemetry)
                writer.writeMessage(1, this.telemetry, () => this.telemetry.serialize(writer));
            if (this.has_session)
                writer.writeMessage(2, this.session, () => this.session.serialize(writer));
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GetTelemetryJSONSchemaResponse {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GetTelemetryJSONSchemaResponse();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    case 1:
                        reader.readMessage(message.telemetry, () => message.telemetry = dependency_1.google.protobuf.Struct.deserialize(reader));
                        break;
                    case 2:
                        reader.readMessage(message.session, () => message.session = dependency_1.google.protobuf.Struct.deserialize(reader));
                        break;
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): GetTelemetryJSONSchemaResponse {
            return GetTelemetryJSONSchemaResponse.deserialize(bytes);
        }
    }
    export class GetTelemetryJSONSchemaStringResponse extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {
            telemetry?: string;
            session?: string;
        }) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") {
                if ("telemetry" in data && data.telemetry != undefined) {
                    this.telemetry = data.telemetry;
                }
                if ("session" in data && data.session != undefined) {
                    this.session = data.session;
                }
            }
        }
        get telemetry() {
            return pb_1.Message.getFieldWithDefault(this, 1, "") as string;
        }
        set telemetry(value: string) {
            pb_1.Message.setField(this, 1, value);
        }
        get session() {
            return pb_1.Message.getFieldWithDefault(this, 2, "") as string;
        }
        set session(value: string) {
            pb_1.Message.setField(this, 2, value);
        }
        static fromObject(data: {
            telemetry?: string;
            session?: string;
        }): GetTelemetryJSONSchemaStringResponse {
            const message = new GetTelemetryJSONSchemaStringResponse({});
            if (data.telemetry != null) {
                message.telemetry = data.telemetry;
            }
            if (data.session != null) {
                message.session = data.session;
            }
            return message;
        }
        toObject() {
            const data: {
                telemetry?: string;
                session?: string;
            } = {};
            if (this.telemetry != null) {
                data.telemetry = this.telemetry;
            }
            if (this.session != null) {
                data.session = this.session;
            }
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (this.telemetry.length)
                writer.writeString(1, this.telemetry);
            if (this.session.length)
                writer.writeString(2, this.session);
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GetTelemetryJSONSchemaStringResponse {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GetTelemetryJSONSchemaStringResponse();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    case 1:
                        message.telemetry = reader.readString();
                        break;
                    case 2:
                        message.session = reader.readString();
                        break;
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): GetTelemetryJSONSchemaStringResponse {
            return GetTelemetryJSONSchemaStringResponse.deserialize(bytes);
        }
    }
    interface GrpcUnaryServiceInterface<P, R> {
        (message: P, metadata: grpc_1.Metadata, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
        (message: P, metadata: grpc_1.Metadata, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
        (message: P, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
        (message: P, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
    }
    interface GrpcStreamServiceInterface<P, R> {
        (message: P, metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
        (message: P, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
    }
    interface GrpWritableServiceInterface<P, R> {
        (metadata: grpc_1.Metadata, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
        (metadata: grpc_1.Metadata, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
        (options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
        (callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
    }
    interface GrpcChunkServiceInterface<P, R> {
        (metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
        (options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
    }
    interface GrpcPromiseServiceInterface<P, R> {
        (message: P, metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): Promise<R>;
        (message: P, options?: grpc_1.CallOptions): Promise<R>;
    }
    export abstract class UnimplementedSchemaService {
        static definition = {
            GetTelemetryTypes: {
                path: "/iracing.telemetry.Schema/GetTelemetryTypes",
                requestStream: false,
                responseStream: false,
                requestSerialize: (message: GetTelemetryTypesRequest) => Buffer.from(message.serialize()),
                requestDeserialize: (bytes: Buffer) => GetTelemetryTypesRequest.deserialize(new Uint8Array(bytes)),
                responseSerialize: (message: GetTelemetryTypesResponse) => Buffer.from(message.serialize()),
                responseDeserialize: (bytes: Buffer) => GetTelemetryTypesResponse.deserialize(new Uint8Array(bytes))
            },
            GetTelemetryJSONSchema: {
                path: "/iracing.telemetry.Schema/GetTelemetryJSONSchema",
                requestStream: false,
                responseStream: false,
                requestSerialize: (message: GetTelemetryJSONSchemaRequest) => Buffer.from(message.serialize()),
                requestDeserialize: (bytes: Buffer) => GetTelemetryJSONSchemaRequest.deserialize(new Uint8Array(bytes)),
                responseSerialize: (message: GetTelemetryJSONSchemaResponse) => Buffer.from(message.serialize()),
                responseDeserialize: (bytes: Buffer) => GetTelemetryJSONSchemaResponse.deserialize(new Uint8Array(bytes))
            },
            GetTelemetryJSONSchemaString: {
                path: "/iracing.telemetry.Schema/GetTelemetryJSONSchemaString",
                requestStream: false,
                responseStream: false,
                requestSerialize: (message: GetTelemetryJSONSchemaRequest) => Buffer.from(message.serialize()),
                requestDeserialize: (bytes: Buffer) => GetTelemetryJSONSchemaRequest.deserialize(new Uint8Array(bytes)),
                responseSerialize: (message: GetTelemetryJSONSchemaStringResponse) => Buffer.from(message.serialize()),
                responseDeserialize: (bytes: Buffer) => GetTelemetryJSONSchemaStringResponse.deserialize(new Uint8Array(bytes))
            }
        };
        [method: string]: grpc_1.UntypedHandleCall;
        abstract GetTelemetryTypes(call: grpc_1.ServerUnaryCall<GetTelemetryTypesRequest, GetTelemetryTypesResponse>, callback: grpc_1.sendUnaryData<GetTelemetryTypesResponse>): void;
        abstract GetTelemetryJSONSchema(call: grpc_1.ServerUnaryCall<GetTelemetryJSONSchemaRequest, GetTelemetryJSONSchemaResponse>, callback: grpc_1.sendUnaryData<GetTelemetryJSONSchemaResponse>): void;
        abstract GetTelemetryJSONSchemaString(call: grpc_1.ServerUnaryCall<GetTelemetryJSONSchemaRequest, GetTelemetryJSONSchemaStringResponse>, callback: grpc_1.sendUnaryData<GetTelemetryJSONSchemaStringResponse>): void;
    }
    export class SchemaClient extends grpc_1.makeGenericClientConstructor(UnimplementedSchemaService.definition, "Schema", {}) {
        constructor(address: string, credentials: grpc_1.ChannelCredentials, options?: Partial<grpc_1.ChannelOptions>) {
            super(address, credentials, options);
        }
        GetTelemetryTypes: GrpcPromiseServiceInterface<GetTelemetryTypesRequest, GetTelemetryTypesResponse> = (message: GetTelemetryTypesRequest, metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): Promise<GetTelemetryTypesResponse> => { if (!metadata) {
            metadata = new grpc_1.Metadata;
        } if (!options) {
            options = {};
        } return new Promise((resolve, reject) => super.GetTelemetryTypes(message, metadata, options, (error: grpc_1.ServiceError, response: GetTelemetryTypesResponse) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(response);
            }
        })); };
        GetTelemetryJSONSchema: GrpcPromiseServiceInterface<GetTelemetryJSONSchemaRequest, GetTelemetryJSONSchemaResponse> = (message: GetTelemetryJSONSchemaRequest, metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): Promise<GetTelemetryJSONSchemaResponse> => { if (!metadata) {
            metadata = new grpc_1.Metadata;
        } if (!options) {
            options = {};
        } return new Promise((resolve, reject) => super.GetTelemetryJSONSchema(message, metadata, options, (error: grpc_1.ServiceError, response: GetTelemetryJSONSchemaResponse) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(response);
            }
        })); };
        GetTelemetryJSONSchemaString: GrpcPromiseServiceInterface<GetTelemetryJSONSchemaRequest, GetTelemetryJSONSchemaStringResponse> = (message: GetTelemetryJSONSchemaRequest, metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): Promise<GetTelemetryJSONSchemaStringResponse> => { if (!metadata) {
            metadata = new grpc_1.Metadata;
        } if (!options) {
            options = {};
        } return new Promise((resolve, reject) => super.GetTelemetryJSONSchemaString(message, metadata, options, (error: grpc_1.ServiceError, response: GetTelemetryJSONSchemaStringResponse) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(response);
            }
        })); };
    }
}
