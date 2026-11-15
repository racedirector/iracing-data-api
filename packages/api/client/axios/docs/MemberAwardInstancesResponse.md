# MemberAwardInstancesResponse

Direct metadata and award-instance download URL observed from /data/member/award_instances.

## Properties

| Name         | Type                                                                        | Description | Notes                  |
| ------------ | --------------------------------------------------------------------------- | ----------- | ---------------------- |
| **type**     | **string**                                                                  |             | [default to undefined] |
| **data**     | [**MemberAwardInstancesResponseData**](MemberAwardInstancesResponseData.md) |             | [default to undefined] |
| **data_url** | **string**                                                                  |             | [default to undefined] |

## Example

```typescript
import { MemberAwardInstancesResponse } from "@iracing-data/api-client-axios";

const instance: MemberAwardInstancesResponse = {
  type,
  data,
  data_url,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
