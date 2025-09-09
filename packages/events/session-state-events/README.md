# @iracing-data/session-state-events

EventEmitter for session state telemetry events from iRacing.

## Installation

```
npm install @iracing-data/session-state-events
yarn add @iracing-data/session-state-events
pnpm i @iracing-data/session-state-events
```

## Usage

```typescript
const sessionStateEmitter = new SessionStateEventEmitter().on(
  "change",
  ({ sessionTime, previousSessionState, sessionState }) => {}
);

sessionStateEmitter.process(sessionState);
```
