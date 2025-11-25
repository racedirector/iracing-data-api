# @iracing-data/api-client-fetch

OpenAPI-generated fetch client for `members-ng.iracing.com`.

## Installation

```bash
pnpm add @iracing-data/api-client-fetch
```

## Usage

```typescript
import { AuthApi, Configuration } from "@iracing-data/api-client-fetch";

const api = new AuthApi(new Configuration({ accessToken: "<token>" }));
const response = await api.postAuth();
```

See the generated `docs/` folder for full endpoint and model documentation.
