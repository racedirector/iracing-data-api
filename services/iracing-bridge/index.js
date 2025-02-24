/* eslint-env node */
const { IRacingBridge } = require("@iracing-data/sdk");

const main = async () => {
  console.debug("Attempting to start telemetry collection...");
  const bridge = new IRacingBridge({
    fps: 1,
    retryConnection: true,
    retryIntervalSeconds: 5,
    maxRetryCount: 1,
  });

  // Register event listeners
  bridge.connectionEmitter
    .on("simConnect", (connected) => {
      console.debug(`Sim ${connected ? "connected" : "disconnected"}`);
    })
    .on("telemetryConnect", (connected) => {
      console.debug(`Telemetry ${connected ? "connected" : "disconnected"}`);
    });

  bridge.telemetryEmitter.on("telemetry", (telemetry) =>
    console.debug("Telemetry event:", telemetry)
  );

  bridge.sessionEmitter.on("session", (session) =>
    console.debug("Session event:", session)
  );

  bridge.start();

  const shutdown = async () => {
    bridge.stop();
  };

  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
