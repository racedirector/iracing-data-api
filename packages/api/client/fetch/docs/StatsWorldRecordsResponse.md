# StatsWorldRecordsResponse

Direct world-record chunk manifest observed from /data/stats/world_records.

## Properties

| Name   | Type                                                              |
| ------ | ----------------------------------------------------------------- |
| `type` | string                                                            |
| `data` | [StatsWorldRecordsResponseData](StatsWorldRecordsResponseData.md) |

## Example

```typescript
import type { StatsWorldRecordsResponse } from "@iracing-data/api-client-fetch";

// TODO: Update the object below with actual values
const example = {
  type: null,
  data: null,
} satisfies StatsWorldRecordsResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StatsWorldRecordsResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
