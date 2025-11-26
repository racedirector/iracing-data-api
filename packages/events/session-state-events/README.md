# @iracing-data/session-state-events

EventEmitter that watches the session state telemetry value and surfaces typed change events.

## Installation

```bash
pnpm add @iracing-data/session-state-events
```

## Usage

```typescript
import { SessionStateEventEmitter } from "@iracing-data/session-state-events";

const sessionStateEmitter = new SessionStateEventEmitter().on("change", ({
  sessionTime,
  previousSessionState,
  currentSessionState,
}) => {
  console.log(`${sessionTime}: ${previousSessionState} -> ${currentSessionState}`);
});

sessionStateEmitter.process(currentState, sessionTime);
```

Pass each telemetry update's state into `process` to receive `change` events as defined in `SessionStateEventMap`.
