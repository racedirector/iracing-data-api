# ResultsSearchSeriesResponse

Direct manifest response from `/data/results/search_series`.

## Properties

| Name   | Type                                                                  |
| ------ | --------------------------------------------------------------------- |
| `type` | string                                                                |
| `data` | [ResultsSearchSeriesResponseData](ResultsSearchSeriesResponseData.md) |

## Example

```typescript
import type { ResultsSearchSeriesResponse } from "@iracing-data/api-client-fetch";

// TODO: Update the object below with actual values
const example = {
  type: null,
  data: null,
} satisfies ResultsSearchSeriesResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ResultsSearchSeriesResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
