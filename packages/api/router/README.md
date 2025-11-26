# @iracing-data/api-router

A Better Call router bundling the generated `/data` API routes with helpers for running them in a Node.js server.

## Installation

```bash
pnpm add @iracing-data/api-router
```

## Usage

```typescript
import createRouter, { toNodeHandler } from "@iracing-data/api-router";

const router = createRouter();
const handler = toNodeHandler(router);

// handler can be mounted in http.createServer or frameworks that accept Node handlers
```

The package re-exports the generated fetch client and middleware helpers so you can compose routes or mount them alongside other services.
