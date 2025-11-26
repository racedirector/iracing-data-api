# @iracing-data/car-session-flag-events

Per-car session flag EventEmitter for telemetry streams (black, blue, furled, repair, etc.).

## Installation

```bash
pnpm add @iracing-data/car-session-flag-events
```

## Usage

```typescript
import { CarSessionFlagEventEmitter } from "@iracing-data/car-session-flag-events";

const carFlags = new CarSessionFlagEventEmitter().on("black", ({ carIndex, sessionTime }) => {
  console.log(`Car ${carIndex} received a black flag at ${sessionTime}`);
});

carFlags.process(carFlagsBitset, sessionTime);
```

`process` consumes the per-car flag array from telemetry and emits the events described in `CarSessionFlagEventMap`, including cleared events when penalties are removed.
