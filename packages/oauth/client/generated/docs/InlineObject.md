# InlineObject

## Properties

| Name               | Type   |
| ------------------ | ------ |
| `status`           | number |
| `statusReason`     | string |
| `error`            | string |
| `errorDescription` | string |
| `errorUri`         | string |
| `state`            | string |

## Example

```typescript
import type { InlineObject } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  status: null,
  statusReason: null,
  error: null,
  errorDescription: null,
  errorUri: null,
  state: null,
} satisfies InlineObject;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InlineObject;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
