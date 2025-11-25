# @iracing-data/telemetry-types

TypeScript definitions for the telemetry services exposed by `iracing-telemetry-grpc`.

## Installation

```bash
pnpm add @iracing-data/telemetry-types
```

## Usage

```typescript
import { TelemetryData, SessionState } from "@iracing-data/telemetry-types";

const example: TelemetryData = { SessionTime: "0.0", SessionState: SessionState.invalid };
```

The types are generated from the telemetry JSON schemas and are shared across telemetry clients and event emitters.
