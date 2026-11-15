# MemberAwardInstancesResponseData

## Properties

| Name         | Type    |
| ------------ | ------- |
| `success`    | boolean |
| `custId`     | number  |
| `awardCount` | number  |
| `awardId`    | number  |

## Example

```typescript
import type { MemberAwardInstancesResponseData } from "@iracing-data/api-client-fetch";

// TODO: Update the object below with actual values
const example = {
  success: null,
  custId: null,
  awardCount: null,
  awardId: null,
} satisfies MemberAwardInstancesResponseData;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as MemberAwardInstancesResponseData;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
