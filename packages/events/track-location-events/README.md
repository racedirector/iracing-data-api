# @iracing-data/track-location-events

EventEmitter for track location telemetry events from iRacing.

## Installation

```
npm install @iracing-data/track-location-events
yarn add @iracing-data/track-location-events
pnpm i @iracing-data/track-location-events
```

## Usage

```typescript
const emitter = new TrackLocationEventEmitter().on(
  "change",
  ({ sessionTime, previousTrackLocation, currentTrackLocation }) => {}
);

emitter.process(trackLocation, sessionTime);
```
