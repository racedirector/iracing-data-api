import { EventEmitter } from "events";
import TypedEmitter, { EventMap } from "typed-emitter";
import { Session } from "./session";
import { Telemetry } from "./telemetry";

class IRacingSDKEventEmitter<T extends EventMap> extends (EventEmitter as {
  new <T extends EventMap>(): TypedEmitter<T>;
})<T> {}

type IRacingConnectionEmitterEvents = {
  simConnect: (connected: boolean) => void;
  telemetryConnect: (connected: boolean) => void;
};

export class IRacingConnectionEmitter extends IRacingSDKEventEmitter<IRacingConnectionEmitterEvents> {}

type TelemetryEmitterEvents = {
  telemetry: (telemetry: Telemetry) => void;
  session: (session: Session) => void;
};

export class TelemetryEmitter extends IRacingSDKEventEmitter<TelemetryEmitterEvents> {}
