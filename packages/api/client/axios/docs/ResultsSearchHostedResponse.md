# ResultsSearchHostedResponse

Direct manifest response from `/data/results/search_hosted`.

## Properties

| Name     | Type                                                                      | Description | Notes                  |
| -------- | ------------------------------------------------------------------------- | ----------- | ---------------------- |
| **type** | **string**                                                                |             | [default to undefined] |
| **data** | [**ResultsSearchSeriesResponseData**](ResultsSearchSeriesResponseData.md) |             | [default to undefined] |

## Example

```typescript
import { ResultsSearchHostedResponse } from "@iracing-data/api-client-axios";

const instance: ResultsSearchHostedResponse = {
  type,
  data,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
