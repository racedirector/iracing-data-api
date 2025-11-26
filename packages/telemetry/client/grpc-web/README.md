# @iracing-data/telemetry-client-grpc-web

Typed gRPC-Web client for connecting to `iracing-telemetry-grpc` from browser environments.

## Installation

```bash
pnpm add @iracing-data/telemetry-client-grpc-web
```

## Usage

```typescript
import { TelemetryClient } from "@iracing-data/telemetry-client-grpc-web";

const client = new TelemetryClient({
  url: "https://telemetry.example.com",
});

const stream = client.streamTelemetry({ keys: ["SessionTime"] });
```

Generated service types mirror the gRPC API exported by the telemetry server.
