# @iracing-data/api-schema

Zod schemas for the iRacing `/data` API responses and requests. These definitions power code generation for clients and routers across the monorepo.

## Installation

```bash
pnpm add @iracing-data/api-schema
```

## Usage

```typescript
import { IRacingGetCarResponseSchema } from "@iracing-data/api-schema";

const result = IRacingGetCarResponseSchema.parse(apiResponse);
```

Use the schemas directly for runtime validation or feed them into helpers like `@iracing-data/api-schema-to-openapi` for OpenAPI generation.
