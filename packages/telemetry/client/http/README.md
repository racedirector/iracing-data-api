# @iracing-data/telemetry-client-http

Thin axios-powered client for interacting with the iRacing telemetry HTTP API.

## Installation

```bash
pnpm add @iracing-data/telemetry-client-http
```

## Usage

```typescript
import axios from "axios";
import { IRacingTelemetryAPIClient } from "@iracing-data/telemetry-client-http";

const httpClient = axios.create({ baseURL: "http://localhost:3000" });
const telemetry = new IRacingTelemetryAPIClient(httpClient);

// Access generated endpoints via telemetry.api
```

Create the client with a pre-configured Axios instance and call methods on `telemetry.api` to reach the generated telemetry endpoints.
