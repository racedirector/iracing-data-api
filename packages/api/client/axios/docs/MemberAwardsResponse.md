# MemberAwardsResponse

Direct metadata and award download URL observed from /data/member/awards.

## Properties

| Name         | Type                                                        | Description | Notes                  |
| ------------ | ----------------------------------------------------------- | ----------- | ---------------------- |
| **type**     | **string**                                                  |             | [default to undefined] |
| **data**     | [**MemberAwardsResponseData**](MemberAwardsResponseData.md) |             | [default to undefined] |
| **data_url** | **string**                                                  |             | [default to undefined] |

## Example

```typescript
import { MemberAwardsResponse } from "@iracing-data/api-client-axios";

const instance: MemberAwardsResponse = {
  type,
  data,
  data_url,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
