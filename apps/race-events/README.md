# race-events

Example CLI that connects to an iRacing telemetry server and logs race-control style events (flags, pit lane changes, pace order updates, etc.).

## Setup

1. Copy the template environment file and adjust connection settings:

   ```bash
   cp .env.template .env
   ```

2. Install dependencies from the repo root:

   ```bash
   pnpm install
   ```

## Running

Use the built-in script to run the TypeScript entrypoint with your environment loaded:

```bash
pnpm --filter race-events start
```

The app will connect to the configured telemetry server, subscribe to live data via `@iracing-data/telemetry-client-grpc-node`, and print structured events to the console.
