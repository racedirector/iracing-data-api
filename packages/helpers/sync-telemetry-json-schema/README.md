# @iracing-data/helpers/sync-telemetry-json-schema

Helper functions to download the JSON schema of iRacing telemetry from a https://github.com/racedirector/iracing-telemetry-services gRPC server instance.

## Installation

_Coming soon_

## Usage

### gRPC Server

Exports a function that downloads the JSON schema from the gRPC server to the provided directory.

```typescript
  const API_URL = process.env.API_URL

  const schemaOutputDir = path.join(__dirname, "../schemas");

  const { telemetrySchemaPath, sessionSchemaPath } = await downloadSchema({
    serverUrl: API_URL,
    outputDir: schemaOutputDir,
  });
```

### HTTP Server

_Coming Soon_

#### WebSockets

_Coming Soon_
