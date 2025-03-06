import { createRequire } from "module";

const require = createRequire(import.meta.url);
const addon = require("../build/Release/irsdk.node");

console.log("NodeJS Addon exports:", addon);

const NativeSDK = addon.irsdkNode;
const SessionEmitter = addon.SessionEmitter;
const TelemetryEmitter = addon.TelemetryEmitter;
const TelemetryGenerator = addon.TelemetryGenerator;

export { SessionEmitter, TelemetryEmitter, NativeSDK, TelemetryGenerator };

export default NativeSDK;
