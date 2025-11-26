# @iracing-data/api-client-axios

Axios-based OpenAPI client for the iRacing `/data` API.

## Installation

```bash
pnpm add @iracing-data/api-client-axios
```

## Usage

```typescript
import { AuthApi, Configuration } from "@iracing-data/api-client-axios";

const api = new AuthApi(new Configuration({ accessToken: "<token>" }));
const response = await api.postAuth();
```

Refer to the generated `docs/` directory for the complete list of endpoints and models.
