import { platform } from "os";
import type { NativeSDK } from "@iracing-data/irsdk-native";

export async function getSdkOrMock(): Promise<NativeSDK> {
  if (platform() === "win32") {
    const Sdk = (await import("@iracing-data/irsdk-native")).NativeSDK;
    return new Sdk();
  }

  throw new Error("Invalid platform");
}
