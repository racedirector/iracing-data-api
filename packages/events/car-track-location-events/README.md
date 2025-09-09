# @iracing-data/car-track-location-events

EventEmitter for per-car track location telemetry events from iRacing.

## Installation

```
npm install @iracing-data/car-track-location-events
yarn add @iracing-data/car-track-location-events
pnpm i @iracing-data/car-track-location-events
```

## Usage

```typescript
const emitter = new CarTrackLocationEventEmitter().on(
  "change",
  ({ sessionTime, previousTrackLocation, trackLocation, carIndex }) => {}
);

emitter.process(trackLocations, sessionTime);
```
