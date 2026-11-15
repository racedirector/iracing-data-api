# MemberAwardInstancesResponse

Direct metadata and award-instance download URL observed from /data/member/award_instances.

## Properties

| Name      | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `type`    | string                                                                  |
| `data`    | [MemberAwardInstancesResponseData](MemberAwardInstancesResponseData.md) |
| `dataUrl` | string                                                                  |

## Example

```typescript
import type { MemberAwardInstancesResponse } from "@iracing-data/api-client-fetch";

// TODO: Update the object below with actual values
const example = {
  type: null,
  data: null,
  dataUrl: null,
} satisfies MemberAwardInstancesResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MemberAwardInstancesResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
