# TokenGrantResponse

## Properties

| Name                    | Type   |
| ----------------------- | ------ |
| `accessToken`           | string |
| `tokenType`             | string |
| `expiresIn`             | number |
| `refreshToken`          | string |
| `refreshTokenExpiresIn` | number |
| `scope`                 | string |

## Example

```typescript
import type { TokenGrantResponse } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  accessToken: null,
  tokenType: null,
  expiresIn: null,
  refreshToken: null,
  refreshTokenExpiresIn: null,
  scope: null,
} satisfies TokenGrantResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TokenGrantResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
