import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { IRacingBridge } from "@iracing-data/sdk";
import { DumpFormat } from "./types";
import { exists } from "./util";

export * from "./types";

export interface SDKDumpOptions {
  /**
   * The directory to output the SDK dump to.
   */
  outputDir: string;

  /**
   * The format to output the SDK dump in.
   */
  format?: DumpFormat;
}

export async function sdkDump(options: SDKDumpOptions) {
  console.info("Dumping SDK data with options:", options);

  const bridge = new IRacingBridge({
    retryConnection: true,
    retryIntervalSeconds: 1,
  });

  // Start the bridge and wait for connection
  try {
    await bridge.startAsync();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to start bridge:", error.message);
    }
  }

  // Create the output directory if it doesn't already exist
  const outputExists = await exists(options.outputDir);
  if (!outputExists) {
    console.info("Output directory does not exist. Creating...");
    await mkdir(options.outputDir, { recursive: true });
  }

  // Get the next telemetry value and write it to a file
  console.info("Writing telemetry data...");
  const telemetry = bridge.telemetryGenerator().next().value;
  await writeFile(
    path.join(options.outputDir, "telemetry.json"),
    JSON.stringify(telemetry || ""),
    "utf-8"
  );

  // Get the next session value and write it to a file
  console.info("Writing session data...");
  const session = bridge.sessionGenerator().next().value;
  await writeFile(
    path.join(options.outputDir, "session.json"),
    JSON.stringify(session || "", null, 2),
    "utf-8"
  );
}

export default sdkDump;
