# @iracing-data/oauth-schema

Zod schemas for the iRacing OAuth 2.0 endpoints, including request/response payloads, header conventions, and scope helpers.

## Installation

```bash
pnpm add @iracing-data/oauth-schema
```

## Usage

```typescript
import { IRacingOAuthAuthorizeParametersSchema } from "@iracing-data/oauth-schema";

const parsed = IRacingOAuthAuthorizeParametersSchema.parse({
  client_id: "example-client",
  redirect_uri: "https://example.com/callback",
  response_type: "code",
});
```

Review `src/schema.ts` for the full list of exported schemas that describe request parameters, headers, and error responses for the OAuth flow.
