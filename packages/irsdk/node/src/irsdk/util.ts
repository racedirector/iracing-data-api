import { platform } from "os";
import { MockSDK } from "./__mocks__";
import type { INativeSDK } from "@iracing-data/irsdk-native";

export async function getSdkOrMock(): Promise<INativeSDK> {
  if (platform() === "win32") {
    const Sdk = (await import("@iracing-data/irsdk-native")).NativeSDK;
    return new Sdk();
  }
  return new MockSDK();
}
