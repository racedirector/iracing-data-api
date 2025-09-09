# @iracing-data/pace-order-events

EventEmitter for car-related session flag telemetry events from iRacing.

## Installation

```
npm install @iracing-data/pace-order-events
yarn add @iracing-data/pace-order-events
pnpm i @iracing-data/pace-order-events
```

## Usage

```typescript
const paceOrderManager = new PaceOrderEventEmitter()
  .on(
    "change",
    ({
      sessionTime,
      previousLines,
      currentLines,
      previousRows,
      currentRows,
      paceMode,
    }) => {}
  )
  .on(
    "rowsChange",
    ({ sessionTime, previousRows, currentRows, paceMode }) => {}
  )
  .on(
    "rowChange",
    ({ sessionTime, previousRow, currentRow, carIndex, paceMode }) => {}
  )
  .on(
    "linesChange",
    ({ sessionTime, previousLines, currentLines, paceMode }) => {}
  )
  .on(
    "lineChange",
    ({ sessionTime, previousLine, currentLine, carIndex, paceMode }) => {}
  )
  .on(
    "carMoved",
    ({
      sessionTime,
      previousLine,
      currentLine,
      previousRow,
      currentRow,
      carIndex,
      paceMode,
    }) => {}
  );
```
