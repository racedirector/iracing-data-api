# TokenGrantResponse

## Properties

| Name                       | Type   |
| -------------------------- | ------ |
| `access_token`             | string |
| `token_type`               | string |
| `expires_in`               | number |
| `refresh_token`            | string |
| `refresh_token_expires_in` | number |
| `scope`                    | string |

## Example

```typescript
import type { TokenGrantResponse } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  access_token: null,
  token_type: null,
  expires_in: null,
  refresh_token: null,
  refresh_token_expires_in: null,
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
