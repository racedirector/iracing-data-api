# GetProfile200Response

## Properties

| Name            | Type   |
| --------------- | ------ |
| `iracingName`   | string |
| `iracingCustId` | number |

## Example

```typescript
import type { GetProfile200Response } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  iracingName: null,
  iracingCustId: null,
} satisfies GetProfile200Response;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetProfile200Response;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
