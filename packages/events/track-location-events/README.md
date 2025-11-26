# @iracing-data/track-location-events

Emits events when the overall session track state changes (e.g., caution, on track, off track) based on telemetry values.

## Installation

```bash
pnpm add @iracing-data/track-location-events
```

## Usage

```typescript
import { TrackLocationEventEmitter } from "@iracing-data/track-location-events";

const trackLocationEvents = new TrackLocationEventEmitter().on("change", ({
  sessionTime,
  previousTrackLocation,
  currentTrackLocation,
}) => {
  console.log(`${sessionTime}: ${previousTrackLocation} -> ${currentTrackLocation}`);
});

trackLocationEvents.process(currentTrackLocation, sessionTime);
```

See `TrackLocationEventMap` for the full list of emitted events.
