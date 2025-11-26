# @iracing-data/pace-flag-events

Emits events for pace-related instructions such as wave-arounds and free passes.

## Installation

```bash
pnpm add @iracing-data/pace-flag-events
```

## Usage

```typescript
import { PaceFlagEventEmitter } from "@iracing-data/pace-flag-events";

const paceFlags = new PaceFlagEventEmitter().on("freePass", ({ carIndex, sessionTime }) => {
  console.log(`Lucky dog for car ${carIndex} at ${sessionTime}`);
});

paceFlags.process(paceFlagsBitset, sessionTime);
```

`process` accepts the per-car pace flag array and emits events defined in `PaceFlagEventMap`.
