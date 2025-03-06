import { createRequire } from "module";

const require = createRequire(import.meta.url);
const addon = require("../build/Release/irsdk.node");

console.log("NodeJS Addon exports:", addon);

const NativeSDK = addon.irsdkNode;
const SessionEmitter = addon.SessionEmitter;
const TelemetryEmitter = addon.TelemetryEmitter;

export { SessionEmitter, TelemetryEmitter, NativeSDK };

export default NativeSDK;
