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

async function* telemetryStream() {
  const generator = new TelemetryGenerator();
  const queue = [];
  let resolveCallback;

  generator.start((data) => {
    if (resolveCallback) {
      resolveCallback({ value: data, done: false });
      resolveCallback = null;
    } else {
      queue.push(data);
    }
  });

  try {
    while (true) {
      yield new Promise((resolve) => {
        if (queue.length > 0) {
          resolve({ value: queue.shift(), done: false });
        } else {
          resolveCallback = resolve;
        }
      });
    }
  } finally {
    generator.stop();
  }
}

export {
  SessionEmitter,
  TelemetryEmitter,
  NativeSDK,
  TelemetryGenerator,
  TelemetryVariable,
  telemetryStream,
};

export default NativeSDK;
