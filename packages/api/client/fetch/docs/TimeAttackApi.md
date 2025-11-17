# TimeAttackApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getTimeAttackMemberSeasonResults**](TimeAttackApi.md#gettimeattackmemberseasonresults) | **GET** /data/time_attack/member_season_results |  |



## getTimeAttackMemberSeasonResults

> IracingAPIResponse getTimeAttackMemberSeasonResults(ta_comp_season_id)



### Example

```ts
import {
  Configuration,
  TimeAttackApi,
} from '@iracing-data/api-client-fetch';
import type { GetTimeAttackMemberSeasonResultsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TimeAttackApi(config);

  const body = {
    // number
    ta_comp_season_id: 8.14,
  } satisfies GetTimeAttackMemberSeasonResultsRequest;

  try {
    const data = await api.getTimeAttackMemberSeasonResults(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ta_comp_season_id** | `number` |  | [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

