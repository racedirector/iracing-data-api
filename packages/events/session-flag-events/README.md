# @iracing-data/session-flag-events

Typed EventEmitter that raises events when session-level flags change (green, caution, white, checkered, etc.).

## Installation

```bash
pnpm add @iracing-data/session-flag-events
```

## Usage

```typescript
import { SessionFlagEventEmitter } from "@iracing-data/session-flag-events";

const flags = new SessionFlagEventEmitter().on("green", ({ sessionTime }) => {
  console.log(`Green flag at ${sessionTime}`);
});

flags.process(sessionFlags, sessionTime);
```

`process` accepts the bitset from telemetry and emits the events defined in `SessionFlagEventMap`, including specific helper events like `oneToGreen` and `cautionWaving`.
