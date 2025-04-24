/* eslint-env node */
import { KappsTelemetrySocket } from "@iracing-data/ws";

const main = async () => {
  const host = process.env.HOST || "localhost:8182";
  console.debug("Connecting to telemetry server at:", host);
  const socket = new KappsTelemetrySocket(
    ["Speed", "LapDistPct", "SessionTick", "SessionTime"],
    [],
    10,
    host,
    false,
    null,
    () => {
      console.debug("Connected to telemetry server");
    },
    () => {
      console.debug("Disconnected from telemetry server");
    },
    (keys) => {
      const newData = keys.map((key) => socket.data[key]);
      console.debug("New telemetry data:", newData);
    },
    () => {
      console.debug("Socket connect");
    },
    () => {
      console.debug("Socket disconnect");
    }
  );

  setTimeout(() => {
    socket.close();
  }, 10000);
};

main();
