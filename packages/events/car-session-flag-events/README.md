# @iracing-data/car-session-flag-events

EventEmitter for car-related session flag telemetry events from iRacing.

## Installation

```
npm install @iracing-data/car-session-flag-events
yarn add @iracing-data/car-session-flag-events
pnpm i @iracing-data/car-session-flag-events
```

## Usage

```typescript
const carFlagObserver = new CarSessionFlagEventEmitter()
  .on("checkered", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the checkered flag.`
    );
  })
  .on("white", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the white flag.`
    );
  })
  .on("blue", ({ sessionTime, carIndex }) => {
    flagLogger.info({ sessionTime }, `Car ${carIndex} received the blue flag.`);
  })
  .on("blue:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info({ sessionTime }, `Car ${carIndex} cleared the blue flag.`);
  })
  .on("black", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the black flag.`
    );
  })
  .on("black:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info({ sessionTime }, `Car ${carIndex} cleared the black flag.`);
  })
  .on("servicible", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the servicible flag.`
    );
  })
  .on("servicible:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} cleared the servicible flag.`
    );
  })
  .on("furled", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the furled flag.`
    );
  })
  .on("furled:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} cleared the furled flag.`
    );
  })
  .on("repair", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the repair flag.`
    );
  })
  .on("repair:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} cleared the repair flag.`
    );
  });

carFlagObserver.process(
  [
    // session flags array
  ],
  sessionTimeString
);
```
