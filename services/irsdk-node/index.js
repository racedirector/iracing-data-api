/* eslint-env node */
import { IRacingSDK, TelemetryVariable } from "@iracing-data/irsdk-node";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class FlagObserver {
  _lastSessionTick = -1;
  _sessionFlags = new TelemetryVariable("SessionFlags");
  _previousFlags = -1;

  constructor(onFlagChange) {
    this.onFlagChange = onFlagChange;
  }

  tick(tick) {
    if (tick !== this._lastSessionTick) {
      this._lastSessionTick = tick;

      const flags = this._sessionFlags.getInt();
      if (flags !== this._previousFlags) {
        this._previousFlags = flags;
        this.onFlagChange(flags);
      }
    }
  }
}

const main = async () => {
  const iracing = new IRacingSDK();

  // Wait for the iRacing simulation to start
  console.info("Waiting for iRacing simulation to start...");
  await iracing.waitForSimRunning;
  console.info("Simulation started!");

  // Create variables for retrieving telemetry data
  const sessionTick = new TelemetryVariable("SessionTick");
  const flagObserver = new FlagObserver((nextFlags) =>
    console.debug("Flags changed:", nextFlags)
  );

  let lastSessionTick = -1;
  while (await iracing.simIsRunning()) {
    const currentTick = sessionTick.getInt();
    if (lastSessionTick !== currentTick) {
      console.debug(`Session tick: ${lastSessionTick} => ${currentTick}`);
      lastSessionTick = currentTick;

      // TODO: Do things that only matter when there is a tick update
      flagObserver.tick();
    }

    // Sleep for 5s
    await sleep(5 * 1000);
  }

  console.info("iRacing simulation disconnected!");

  const shutdown = async () => {
    process.exit(1);
  };

  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
