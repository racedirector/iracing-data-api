# @iracing-data/car-track-location-events

Typed EventEmitter for per-car track location telemetry events such as pit stall entry, off-track excursions, and disconnects.

## Installation

```bash
pnpm add @iracing-data/car-track-location-events
```

## Usage

```typescript
import { CarTrackLocationEventEmitter } from "@iracing-data/car-track-location-events";

const emitter = new CarTrackLocationEventEmitter().on("change", ({
  carIndex,
  currentTrackLocation,
  previousTrackLocation,
}) => console.log(carIndex, previousTrackLocation, "->", currentTrackLocation));

emitter.process(trackLocations, sessionTime);
```

`process` accepts the track location array from telemetry and emits the events described in `CarTrackLocationEventMap` (`change`, `notInWorld`, `offTrack`, `inPitStall`, and more).
