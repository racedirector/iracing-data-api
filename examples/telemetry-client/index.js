/* eslint-env node */
import { TelemetryClient } from "@iracing-data/grpc-node";

const main = async () => {
  const apiUrl = process.env.API_URL || "localhost:50051";

  const client = new TelemetryClient(apiUrl);
  const stream = client
    .subscribeTelemetry(1, [
      "DriverInfo",
      "PaceMode",
      "PitsOpen",
      "PlayerCarIdx",
      "SessionFlags",
      "SessionTick",
      "SessionTime",
    ])
    .on("data", (data) => {
      const {
        DriverInfo,
        PaceMode,
        PitsOpen,
        PlayerCarIdx,
        SessionFlags,
        SessionTick,
        SessionTime,
      } = JSON.parse(data);

      // TODO: DO something with the data
    });

  const shutdown = () => {
    stream.cancel();
  };

  const response = await client.dumpTelemetry();
  const telemetry = JSON.parse(response.telemetry);
  console.info("Telemetry data:", telemetry);

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
