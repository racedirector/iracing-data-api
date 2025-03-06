/* eslint-env node */
import { NativeSDK } from "@iracing-data/irsdk-native";

const waitAsync = async (sdk, timeout) => {
  console.time("waitForDataAsync");
  await sdk.waitForDataAsync(timeout);
  console.timeEnd("waitForDataAsync");
};

const waitSessionDataAsync = async (sdk) => {
  console.time("waitForSessionDataAsync");
  try {
    const sessionData = await sdk.waitForSessionDataUpdate();
    console.debug(sessionData);

    const sessionDataUpdate = await sdk.waitForSessionDataUpdate();
    console.debug("SessionData", sessionDataUpdate);
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  const sdk = new NativeSDK();

  // Wait up to 1s for data to be available
  if (sdk.waitForData(1000)) {
    console.log("Data is available");
  } else {
    console.log("Data is not available");
  }

  // waitSessionDataAsync(sdk);
  // waitAsync(sdk, 1000);

  // for (let i = 0; i < 5; i++) {
  //   console.time("waitForDataAsync");
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //   console.timeEnd("waitForDataAsync");
  // }

  const shutdown = async () => {
    process.exit(1);
  };

  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
