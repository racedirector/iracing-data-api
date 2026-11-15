# LeagueRosterResponse

Direct metadata and roster download URL observed from `/data/league/roster`.

## Properties

| Name         | Type                                                        | Description | Notes                  |
| ------------ | ----------------------------------------------------------- | ----------- | ---------------------- |
| **type**     | **string**                                                  |             | [default to undefined] |
| **data**     | [**LeagueRosterResponseData**](LeagueRosterResponseData.md) |             | [default to undefined] |
| **data_url** | **string**                                                  |             | [default to undefined] |

## Example

```typescript
import { LeagueRosterResponse } from "@iracing-data/api-client-axios";

const instance: LeagueRosterResponse = {
  type,
  data,
  data_url,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
