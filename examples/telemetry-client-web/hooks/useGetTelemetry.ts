import { useRef, useState, useEffect } from "react";
import { TelemetryClient } from "@iracing-data/grpc-web";
import type {
  TelemetryData,
  TelemetryKey,
} from "@iracing-data/telemetry-types";

export interface UseGetTelemetryOptions<K extends TelemetryKey = TelemetryKey> {
  host?: string;
  keys: K[];
}

export interface UseGetTelemetryHook {
  <K extends TelemetryKey = TelemetryKey>(
    options: UseGetTelemetryOptions<K>
  ): Pick<TelemetryData, K>;
}

export const useGetTelemetry: UseGetTelemetryHook = ({
  host = "http://localhost:8080",
  keys,
}) => {
  const telemetryClient = useRef(new TelemetryClient(host));
  const [data, setData] = useState<ReturnType<UseGetTelemetryHook>>({});

  useEffect(() => {
    const getTelemetry = async () => {
      const response = await telemetryClient.current.getTelemetry(keys);
      const telemetry = JSON.parse(
        response.getTelemetry()
      ) as ReturnType<UseGetTelemetryHook>;

      setData(telemetry);
    };

    getTelemetry();
  }, [telemetryClient]);

  return data;
};

export default useGetTelemetry;
