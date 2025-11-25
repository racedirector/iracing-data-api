# @iracing-data/helpers/iracing-json-schema-to-typescript

Transforms the downloaded telemetry JSON schemas into TypeScript definitions.

## Installation

```bash
pnpm add @iracing-data/helpers/iracing-json-schema-to-typescript
```

## Usage

```typescript
import path from "node:path";
import { generateTypesFromSchema } from "@iracing-data/helpers/iracing-json-schema-to-typescript";

await generateTypesFromSchema({
  schemaPath: path.join(process.cwd(), "schemas/telemetry.json"),
  outputPath: path.join(process.cwd(), "src/generated/telemetry-types.ts"),
});
```

Combine this helper with `@iracing-data/helpers/sync-telemetry-json-schema` to fetch and convert schemas in one workflow.
