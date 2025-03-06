/* eslint-env node */
import { IRacingSDK } from "@iracing-data/irsdk-node";

const main = async () => {
  const iracing = new IRacingSDK();

  // Wait for the iRacing simulation to start
  console.info("Waiting for iRacing simulation to start...");
  await iracing.waitForSimRunning;
  console.info("Simulation started!");

  while (await iracing.simIsRunning()) {
    // TODO: Do stuff while it's running
  }

  console.info("iRacing simulation disconnected!");

  const shutdown = async () => {
    process.exit(1);
  };

  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
