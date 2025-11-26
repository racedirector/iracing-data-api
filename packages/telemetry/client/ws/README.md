# @iracing-data/telemetry-client-ws

WebSocket telemetry client for iRacing telemetry servers that stream key/value updates.

## Installation

```bash
pnpm add @iracing-data/telemetry-client-ws
```

## Usage

```typescript
import { IRacingTelemetrySocket } from "@iracing-data/telemetry-client-ws";

const socket = new IRacingTelemetrySocket("localhost:3000", 5, ["SessionTime"], 2000,
  () => console.log("ws connected"),
  () => console.log("ws disconnected"),
  () => console.log("telemetry connected"),
  () => console.log("telemetry disconnected"),
  (keys) => console.log("updated", keys)
);
```

Provide the server address, target FPS, and telemetry keys to subscribe. Optional callbacks let you react to WebSocket and telemetry connection changes as well as incremental updates.
