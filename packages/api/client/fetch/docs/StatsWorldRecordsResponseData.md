# StatsWorldRecordsResponseData

## Properties

| Name          | Type                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| `success`     | boolean                                                                                 |
| `carId`       | number                                                                                  |
| `trackId`     | number                                                                                  |
| `chunkInfo`   | [ResultsSearchSeriesResponseDataChunkInfo](ResultsSearchSeriesResponseDataChunkInfo.md) |
| `lastUpdated` | string                                                                                  |

## Example

```typescript
import type { StatsWorldRecordsResponseData } from "@iracing-data/api-client-fetch";

// TODO: Update the object below with actual values
const example = {
  success: null,
  carId: null,
  trackId: null,
  chunkInfo: null,
  lastUpdated: null,
} satisfies StatsWorldRecordsResponseData;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StatsWorldRecordsResponseData;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
