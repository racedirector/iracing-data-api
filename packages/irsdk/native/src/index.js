/* eslint-env node */
/* eslint-disable import/order */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const isDevelopment = process.env.NODE_ENV !== "development";

const addon = isDevelopment
  ? require("../build/Debug/irsdk.node")
  : require("../build/Release/irsdk.node");

const NativeSDK = addon.irsdkNode;
const SessionEmitter = addon.SessionEmitter;
const TelemetryVariable = addon.TelemetryVariable;
const TelemetryEmitter = addon.TelemetryEmitter;
const TelemetryGenerator = addon.TelemetryGenerator;

const _sdk = new NativeSDK();

export {
  SessionEmitter,
  TelemetryEmitter,
  NativeSDK,
  TelemetryGenerator,
  TelemetryVariable,
};

export default NativeSDK;
