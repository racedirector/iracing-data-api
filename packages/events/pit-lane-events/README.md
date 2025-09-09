# @iracing-data/pit-lane-events

An EventEmitter for pit-lane events from iRacing telemetry.

## Installation

```
npm install @iracing-data/pit-lane-events
yarn add @iracing-data/pit-lane-events
pnpm i @iracing-data/pit-lane-events
```

## Usage

```typescript
const pitLaneManager = new PitLaneManager()
  .on("pitlane:opened", ({ sessionTime }) => {
    pitLaneLogger.info({ sessionTime, type: "pit-open" }, "Pit lane opened");
  })
  .on("pitlane:closed", ({ sessionTime }) => {
    pitLaneLogger.info({ sessionTime, type: "pit-close" }, "Pit lane closed");
  })
  .on(
    "pitroad:entered",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      pitLaneLogger.info(
        { sessionTime, type: "pit-entry", carIndex },
        `${isPaceCar ? "Pace car" : `Car ${carIndex}`} entered ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  )
  .on(
    "pitroad:exited",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      pitLaneLogger.info(
        { sessionTime, type: "pit-exit", carIndex },
        `${isPaceCar ? "Pace car" : `Car ${carIndex}`} exited ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  );
```
