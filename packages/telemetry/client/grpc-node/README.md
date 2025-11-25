# @iracing-data/telemetry-client-grpc-node

Node.js gRPC client bindings for [`iracing-telemetry-grpc`](https://github.com/racedirector/iracing-telemetry-grpc).

## Installation

```bash
pnpm add @iracing-data/telemetry-client-grpc-node
```

## Usage

```typescript
import { TelemetryClient } from "@iracing-data/telemetry-client-grpc-node";

const client = new TelemetryClient({ url: "localhost:50051" });
const stream = client.streamTelemetry({ keys: ["SessionTime", "Speed"] });
```

The generated definitions expose the same services and messages as the telemetry server for easy consumption in Node.js apps.
