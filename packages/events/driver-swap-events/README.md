# @iracing-data/driver-swap-events

Detects driver changes in multi-driver sessions and emits typed events when a new driver takes over a car.

## Installation

```bash
pnpm add @iracing-data/driver-swap-events
```

## Usage

```typescript
import { DriverSwapEventEmitter } from "@iracing-data/driver-swap-events";

const driverSwaps = new DriverSwapEventEmitter().on("change", ({ currentDriver }) => {
  console.log(`Driver changed to ${currentDriver.UserName}`);
});

// Pass the DriverInfo.Drivers array from telemetry each tick
await driverSwaps.process(drivers, sessionTime);
```

The emitter exposes a single `change` event described by `DriverSwapEventMap` to surface previous and current driver details.
