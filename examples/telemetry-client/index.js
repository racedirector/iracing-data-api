/* eslint-env node */
import { TelemetryClient } from "@iracing-data/grpc-node";

const main = async () => {
  const apiUrl = process.env.API_URL || "localhost:50051";

  const client = new TelemetryClient(apiUrl);

  const shutdown = () => {};

  const response = await client.dumpTelemetry();
  const telemetry = JSON.parse(response.telemetry);

  console.info("Telemetry data:", telemetry);

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
