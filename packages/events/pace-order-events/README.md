# @iracing-data/pace-order-events

EventEmitter that tracks the pacing order (rows and lines) for each car during cautions.

## Installation

```bash
pnpm add @iracing-data/pace-order-events
```

## Usage

```typescript
import { PaceOrderEventEmitter } from "@iracing-data/pace-order-events";

const paceOrder = new PaceOrderEventEmitter().on("carMoved", ({ carIndex, currentRow, currentLine }) => {
  console.log(`Car ${carIndex} moved to row ${currentRow}, line ${currentLine}`);
});

paceOrder.process(paceLines, paceRows, paceMode, sessionTime);
```

`process` compares the latest pace lines/rows to the previous tick and emits the events declared in `PaceOrderEventMap` (`change`, `rowsChange`, `linesChange`, and per-car movement events).
