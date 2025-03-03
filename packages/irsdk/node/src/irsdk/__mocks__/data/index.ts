import { TelemetryVarList } from "@iracing-data/irsdk-types";
import { dump as dumpyml } from "js-yaml";

export const loadSessionDataMock = async () => {
  const data = await import("./session.json");
  return dumpyml(data);
};

export const loadTelemetryMock = async () => {
  const data = await import("./telemetry.json");
  return data.default as TelemetryVarList;
};

export const loadMocks = async () => {
  return {
    session: await loadSessionDataMock(),
    telemetry: await loadTelemetryMock(),
  };
};
