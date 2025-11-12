# TimeAttackApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getTimeAttackDocs**](#gettimeattackdocs) | **GET** /data/doc/time_attack | |
|[**getTimeAttackMemberSeasonResults**](#gettimeattackmemberseasonresults) | **GET** /data/time_attack/member_season_results | |
|[**getTimeAttackMemberSeasonResultsDocs**](#gettimeattackmemberseasonresultsdocs) | **GET** /data/doc/time_attack/member_season_results | |

# **getTimeAttackDocs**
> { [key: string]: IracingServiceMethodDocs; } getTimeAttackDocs()


### Example

```typescript
import {
    TimeAttackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TimeAttackApi(configuration);

const { status, data } = await apiInstance.getTimeAttackDocs();
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

# **getTimeAttackMemberSeasonResults**
> IracingAPIResponse getTimeAttackMemberSeasonResults()


### Example

```typescript
import {
    TimeAttackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TimeAttackApi(configuration);

let ta_comp_season_id: number; // (default to undefined)

const { status, data } = await apiInstance.getTimeAttackMemberSeasonResults(
    ta_comp_season_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ta_comp_season_id** | [**number**] |  | defaults to undefined|


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

# **getTimeAttackMemberSeasonResultsDocs**
> IracingServiceMethodDocs getTimeAttackMemberSeasonResultsDocs()


### Example

```typescript
import {
    TimeAttackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TimeAttackApi(configuration);

const { status, data } = await apiInstance.getTimeAttackMemberSeasonResultsDocs();
```

### Parameters
This endpoint does not have any parameters.


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

