# @iracing-data/session-flag-events

An EventEmitter for session flag events from iRacing telemetry.

## Installation

```
npm install @iracing-data/session-flag-events
yarn add @iracing-data/session-flag-events
pnpm i @iracing-data/session-flag-events
```

## Usage

```typescript
const sessionFlagObserver = new SessionFlagObserver()
  .on("startHidden", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start hidden.");
  })
  .on("startReady", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start ready.");
  })
  .on("startSet", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start set.");
  })
  .on("startGo", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start go.");
  })
  .on("oneToGreen", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "One to green.");
  })
  .on("greenHeld", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Green held.");
  })
  .on("randomWaving", ({ sessionTime }) => {
    flagLogger.info(
      { sessionTime },
      "Barney is the little kid in the background going crazy (random waving)."
    );
  })
  .on("green", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Green, green, green.");
  })
  .on("caution", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Caution is shown.");
  })
  .on("cautionWaving", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Caution is waving.");
  })
  .on("tenToGo", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Ten to go.");
  })
  .on("fiveToGo", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Five to go.");
  })
  .on("white", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "White flag, one to go.");
  })
  .on("checkered", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Checkered flag.");
  });
```
