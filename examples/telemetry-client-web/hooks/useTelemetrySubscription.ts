import { useRef, useState, useEffect } from "react";
import { TelemetryClient } from "@iracing-data/grpc-web";
import type {
  TelemetryData,
  TelemetryKey,
} from "@iracing-data/telemetry-types";

export interface UseTelemetrySubscriptionOptions<
  K extends TelemetryKey = TelemetryKey
> {
  host?: string;
  fps?: number;
  keys: K[];
}

export interface UseTelemetrySubscriptionHook {
  <K extends TelemetryKey = TelemetryKey>(
    options: UseTelemetrySubscriptionOptions<K>
  ): Partial<Pick<TelemetryData, K>>;
}

export const useTelemetrySubscription: UseTelemetrySubscriptionHook = ({
  host = "http://localhost:8080",
  fps = 10,
  keys,
}) => {
  const telemetryClient = useRef(new TelemetryClient(host));
  const [data, setData] = useState<ReturnType<UseTelemetrySubscriptionHook>>(
    {}
  );

  useEffect(() => {
    const stream = telemetryClient.current.subscribeTelemetry(fps, keys);

    stream
      .on("data", (data) => {
        const telemetry = data.getTelemetry();
        const telemetryJson = JSON.parse(
          telemetry
        ) as ReturnType<UseTelemetrySubscriptionHook>;

        setData(telemetryJson);
      })
      .on("error", (error) => {
        console.error("Error:", error);
      })
      .on("metadata", (metadata) => {
        console.info("Metadata:", metadata);
      })
      .on("status", (status) => {
        console.info("Status:", status);
      })
      .on("end", () => {
        console.info("Stream ended");
      });

    return () => {
      stream.cancel();
    };
  }, []);

  return data;
};
