# DriverStatsApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDriverStatsByCategory**](#getdriverstatsbycategory) | **GET** /data/driver_stats_by_category/{category} | |
|[**getDriverStatsByCategoryCategoryDocs**](#getdriverstatsbycategorycategorydocs) | **GET** /data/doc/driver_stats_by_category/{category} | |
|[**getDriverStatsByCategoryDocs**](#getdriverstatsbycategorydocs) | **GET** /data/doc/driver_stats_by_category | |

# **getDriverStatsByCategory**
> IracingAPIResponse getDriverStatsByCategory()


### Example

```typescript
import {
    DriverStatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DriverStatsApi(configuration);

let category: IracingCategory; //Racing category. (default to undefined)

const { status, data } = await apiInstance.getDriverStatsByCategory(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | **IracingCategory** | Racing category. | defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDriverStatsByCategoryCategoryDocs**
> IracingServiceMethodDocs getDriverStatsByCategoryCategoryDocs()


### Example

```typescript
import {
    DriverStatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DriverStatsApi(configuration);

let category: IracingCategory; //Racing category. (default to undefined)

const { status, data } = await apiInstance.getDriverStatsByCategoryCategoryDocs(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | **IracingCategory** | Racing category. | defaults to undefined|


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDriverStatsByCategoryDocs**
> { [key: string]: IracingServiceMethodDocs; } getDriverStatsByCategoryDocs()


### Example

```typescript
import {
    DriverStatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DriverStatsApi(configuration);

const { status, data } = await apiInstance.getDriverStatsByCategoryDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

