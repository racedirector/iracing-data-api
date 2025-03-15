/* eslint-env node */
/* eslint-disable import/order */
import bindings from "bindings";

const addon = bindings("irsdk");

const NativeSDK = addon.irsdkNode;
const TelemetryVariable = addon.TelemetryVariable;
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

export { NativeSDK, TelemetryGenerator, TelemetryVariable, telemetryStream };

export default NativeSDK;
