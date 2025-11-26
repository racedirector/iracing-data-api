# iracing-data-api

A monorepo of TypeScript packages for working with the iRacing `/data` API and telemetry services. Packages cover generated clients, validation schemas, event emitters, telemetry consumers, and helper CLIs.

## Packages

### API
- [@iracing-data/api-schema](packages/api/schema/README.md) – Zod schemas for `/data` endpoints.
- [@iracing-data/api-schema-to-openapi](packages/helpers/api-schema-to-openapi/README.md) – Generate OpenAPI docs from the schemas.
- [@iracing-data/api-client-fetch](packages/api/client/fetch/README.md) – Fetch-based API client.
- [@iracing-data/api-client-axios](packages/api/client/axios/README.md) – Axios-based API client.
- [@iracing-data/api-router](packages/api/router/README.md) – Better Call router bundling generated routes.

### OAuth
- [@iracing-data/oauth-schema](packages/oauth/schema/README.md) – OAuth request/response Zod schemas.
- [@iracing-data/oauth-schema-to-openapi](packages/helpers/oauth-schema-to-openapi/README.md) – OpenAPI generation from OAuth schemas.
- [@iracing-data/oauth-client](packages/oauth/client/README.md) – OAuth client implementation.

### Telemetry
- [@iracing-data/telemetry-types](packages/telemetry/types/README.md) – Generated telemetry TypeScript types.
- [@iracing-data/telemetry-client-grpc-node](packages/telemetry/client/grpc-node/README.md) – Node gRPC telemetry client.
- [@iracing-data/telemetry-client-grpc-web](packages/telemetry/client/grpc-web/README.md) – Browser gRPC-Web telemetry client.
- [@iracing-data/telemetry-client-ws](packages/telemetry/client/ws/README.md) – WebSocket telemetry client.
- [@iracing-data/telemetry-client-http](packages/telemetry/client/http/README.md) – Axios HTTP telemetry client.

### Telemetry Event Emitters
- [@iracing-data/session-state-events](packages/events/session-state-events/README.md)
- [@iracing-data/track-location-events](packages/events/track-location-events/README.md)
- [@iracing-data/car-track-location-events](packages/events/car-track-location-events/README.md)
- [@iracing-data/pit-lane-events](packages/events/pit-lane-events/README.md)
- [@iracing-data/session-flag-events](packages/events/session-flag-events/README.md)
- [@iracing-data/car-session-flag-events](packages/events/car-session-flag-events/README.md)
- [@iracing-data/pace-flag-events](packages/events/pace-flag-events/README.md)
- [@iracing-data/pace-order-events](packages/events/pace-order-events/README.md)
- [@iracing-data/player-pit-stop-events](packages/events/player-pit-stop-events/README.md)
- [@iracing-data/driver-swap-events](packages/events/driver-swap-events/README.md)

### Helpers
- [@iracing-data/helpers/sync-car-assets](packages/helpers/sync-car-assets/README.md)
- [@iracing-data/helpers/sync-track-assets](packages/helpers/sync-track-assets/README.md)
- [@iracing-data/helpers/sync-telemetry-json-schema](packages/helpers/sync-telemetry-json-schema/README.md)
- [@iracing-data/helpers/iracing-json-schema-to-typescript](packages/helpers/iracing-json-schema-to-typescript/README.md)

## Apps
- [race-events](apps/race-events/README.md) – Example CLI that logs race events from telemetry.
- [@iracing-data/sync-car-assets-cli](apps/sync-car-assets-cli/README.md) – Download car assets via CLI.
- [@iracing-data/sync-track-assets-cli](apps/sync-track-assets-cli/README.md) – Download track assets via CLI.

## Development

This repo uses [pnpm](https://pnpm.io/) for dependency management:

```bash
pnpm install
```

Use `pnpm --filter <package>` to run scripts for a specific workspace package or app. See each linked README for package-specific instructions.
