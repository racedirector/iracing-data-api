# @iracing-data/pit-lane-events

EventEmitter that reports pit lane entry/exit changes for all cars in a session.

## Installation

```bash
pnpm add @iracing-data/pit-lane-events
```

## Usage

```typescript
import { PitLaneEventEmitter } from "@iracing-data/pit-lane-events";

const pitLaneEvents = new PitLaneEventEmitter().on("change", ({ carIndex, isInPitLane }) => {
  console.log(`Car ${carIndex} is ${isInPitLane ? "in" : "out of"} the lane`);
});

pitLaneEvents.process(inPitLaneFlags, sessionTime);
```

`process` accepts the per-car pit lane flags from telemetry and emits events defined by `PitLaneEventMap`.
