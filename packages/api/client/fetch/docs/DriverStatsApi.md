# DriverStatsApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getDriverStatsByCategory**](DriverStatsApi.md#getdriverstatsbycategory) | **GET** /data/driver_stats_by_category/{category} |  |



## getDriverStatsByCategory

> IracingAPIResponse getDriverStatsByCategory(category)



### Example

```ts
import {
  Configuration,
  DriverStatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetDriverStatsByCategoryRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DriverStatsApi(config);

  const body = {
    // IracingCategory | Racing category.
    category: ...,
  } satisfies GetDriverStatsByCategoryRequest;

  try {
    const data = await api.getDriverStatsByCategory(body);
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
| **category** | `IracingCategory` | Racing category. | [Defaults to `undefined`] [Enum: oval, road, dirt_road, dirt_oval, sports_car, formula_car] |

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

