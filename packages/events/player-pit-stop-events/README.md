# @iracing-data/player-pit-stop-events

Typed EventEmitter for tracking the local player's pit road and pit stall state from telemetry updates.

## Installation

```bash
pnpm add @iracing-data/player-pit-stop-events
```

## Usage

```typescript
import { PlayerPitStopEventEmitter } from "@iracing-data/player-pit-stop-events";

const pitEvents = new PlayerPitStopEventEmitter()
  .on("pitroad:entered", ({ sessionTime }) => console.log("Entered pit road", sessionTime))
  .on("pitstall:entered", ({ requestedService }) => console.log("In stall", requestedService));

pitEvents.process({
  isOnPitRoad,
  isPitLaneOpen,
  isPlayerCarInPitStall,
  isPitstopActive,
  serviceFlags,
  serviceStatus,
  trackLocation,
  sessionTime,
});
```

Event names match the `PlayerPitStopEventMap` type in the source, covering pit road entry/exit, stall entry/exit, and service status updates.
