# @iracing-data/helpers/sync-telemetry-json-schema

Downloads the telemetry JSON schemas from an `iracing-telemetry-services` deployment (gRPC) and writes them locally.

## Installation

```bash
pnpm add @iracing-data/helpers/sync-telemetry-json-schema
```

## Usage

```typescript
import path from "node:path";
import { downloadSchema } from "@iracing-data/helpers/sync-telemetry-json-schema";

const schemaOutputDir = path.join(process.cwd(), "schemas");
const { telemetrySchemaPath, sessionSchemaPath } = await downloadSchema({
  serverUrl: process.env.API_URL!,
  outputDir: schemaOutputDir,
});
```

The helper fetches the telemetry and session schemas over gRPC and returns the paths to the downloaded files.
