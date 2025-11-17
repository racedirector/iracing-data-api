# SeasonApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getSeasonList**](#getseasonlist) | **GET** /data/season/list | |
|[**getSeasonRaceGuide**](#getseasonraceguide) | **GET** /data/season/race_guide | |
|[**getSeasonSpectatorSubsessionIds**](#getseasonspectatorsubsessionids) | **GET** /data/season/spectator_subsessionids | |
|[**getSeasonSpectatorSubsessionIdsDetail**](#getseasonspectatorsubsessionidsdetail) | **GET** /data/season/spectator_subsessionids_detail | |

# **getSeasonList**
> IracingAPIResponse getSeasonList()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client-axios';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

let season_year: number; // (default to undefined)
let season_quarter: number; // (default to undefined)

const { status, data } = await apiInstance.getSeasonList(
    season_year,
    season_quarter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_year** | [**number**] |  | defaults to undefined|
| **season_quarter** | [**number**] |  | defaults to undefined|


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

# **getSeasonRaceGuide**
> IracingAPIResponse getSeasonRaceGuide()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client-axios';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

let from: string; //ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time. (optional) (default to undefined)
let include_end_after_from: boolean; //Include sessions which start before \'from\' but end after. (optional) (default to undefined)

const { status, data } = await apiInstance.getSeasonRaceGuide(
    from,
    include_end_after_from
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time. | (optional) defaults to undefined|
| **include_end_after_from** | [**boolean**] | Include sessions which start before \&#39;from\&#39; but end after. | (optional) defaults to undefined|


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

# **getSeasonSpectatorSubsessionIds**
> IracingAPIResponse getSeasonSpectatorSubsessionIds()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client-axios';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

let event_types: Array<IracingEventType>; //Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 (optional) (default to undefined)

const { status, data } = await apiInstance.getSeasonSpectatorSubsessionIds(
    event_types
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **event_types** | **Array&lt;IracingEventType&gt;** | Types of events to include in the search. Defaults to all. ?event_types&#x3D;2,3,4,5 | (optional) defaults to undefined|


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

# **getSeasonSpectatorSubsessionIdsDetail**
> IracingAPIResponse getSeasonSpectatorSubsessionIdsDetail()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client-axios';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

let event_types: Array<IracingEventType>; //Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 (optional) (default to undefined)
let season_ids: Array<number>; //Seasons to include in the search. Defaults to all. ?season_ids=513,937 (optional) (default to undefined)

const { status, data } = await apiInstance.getSeasonSpectatorSubsessionIdsDetail(
    event_types,
    season_ids
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **event_types** | **Array&lt;IracingEventType&gt;** | Types of events to include in the search. Defaults to all. ?event_types&#x3D;2,3,4,5 | (optional) defaults to undefined|
| **season_ids** | **Array&lt;number&gt;** | Seasons to include in the search. Defaults to all. ?season_ids&#x3D;513,937 | (optional) defaults to undefined|


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

