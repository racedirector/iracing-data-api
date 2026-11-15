# StatsWorldRecordsResponseData

## Properties

| Name               | Type                                                                                    | Description | Notes                             |
| ------------------ | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **success**        | **boolean**                                                                             |             | [default to undefined]            |
| **car_id**         | **number**                                                                              |             | [default to undefined]            |
| **track_id**       | **number**                                                                              |             | [default to undefined]            |
| **season_year**    | **number**                                                                              |             | [optional] [default to undefined] |
| **season_quarter** | **number**                                                                              |             | [optional] [default to undefined] |
| **chunk_info**     | [**StatsWorldRecordsResponseDataChunkInfo**](StatsWorldRecordsResponseDataChunkInfo.md) |             | [default to undefined]            |
| **last_updated**   | **string**                                                                              |             | [default to undefined]            |

## Example

```typescript
import { StatsWorldRecordsResponseData } from "@iracing-data/api-client-axios";

const instance: StatsWorldRecordsResponseData = {
  success,
  car_id,
  track_id,
  season_year,
  season_quarter,
  chunk_info,
  last_updated,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
