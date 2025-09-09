# @iracing-data/pace-flag-events

An EventEmitter for pace flag events from iRacing telemetry.

## Installation

```
npm install @iracing-data/pace-flag-events
yarn add @iracing-data/pace-flag-events
pnpm i @iracing-data/pace-flag-events
```

## Usage

```typescript
const paceFlagManager = new PaceFlagEventEmitter()
  .on("waveAround", ({ sessionTime, carIndex }) => {
    paceLogger.info(
      { sessionTime, type: "wave-around", carIndex },
      `Car ${carIndex} was waved around.`
    );
  })
  .on("freePass", ({ sessionTime, carIndex }) => {
    paceLogger.info(
      { sessionTime, type: "free-pass", carIndex },
      `Car ${carIndex} was given a free pass.`
    );
  })
  .on("endOfLine", ({ sessionTime, carIndex }) => {
    paceLogger.info(
      { sessionTime, type: "end-of-line", carIndex },
      `Car ${carIndex} was given EOL.`
    );
  });
```
