# ExchangeToken400Response

## Properties

| Name                | Type   |
| ------------------- | ------ |
| `status`            | number |
| `status_reason`     | string |
| `error`             | string |
| `error_description` | string |
| `error_uri`         | string |
| `state`             | string |

## Example

```typescript
import type { ExchangeToken400Response } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  status: null,
  status_reason: null,
  error: null,
  error_description: null,
  error_uri: null,
  state: null,
} satisfies ExchangeToken400Response;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExchangeToken400Response;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
