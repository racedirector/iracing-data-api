# SeasonApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getSeasonDocs**](#getseasondocs) | **GET** /data/doc/season | |
|[**getSeasonList**](#getseasonlist) | **GET** /data/season/list | |
|[**getSeasonListDocs**](#getseasonlistdocs) | **GET** /data/doc/season/list | |
|[**getSeasonRaceGuide**](#getseasonraceguide) | **GET** /data/season/race_guide | |
|[**getSeasonRaceGuideDocs**](#getseasonraceguidedocs) | **GET** /data/doc/season/race_guide | |
|[**getSeasonSpectatorSubsessionIdsDetailDocs**](#getseasonspectatorsubsessionidsdetaildocs) | **GET** /data/doc/season/spectator_subsessionids_detail | |
|[**getSeasonSpectatorSubsessionIdsDocs**](#getseasonspectatorsubsessionidsdocs) | **GET** /data/doc/season/spectator_subsessionids | |

# **getSeasonDocs**
> { [key: string]: IracingServiceMethodDocs; } getSeasonDocs()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

const { status, data } = await apiInstance.getSeasonDocs();
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

# **getSeasonList**
> IracingAPIResponse getSeasonList()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

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

# **getSeasonListDocs**
> IracingServiceMethodDocs getSeasonListDocs()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

const { status, data } = await apiInstance.getSeasonListDocs();
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

# **getSeasonRaceGuide**
> IracingAPIResponse getSeasonRaceGuide()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

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

# **getSeasonRaceGuideDocs**
> IracingServiceMethodDocs getSeasonRaceGuideDocs()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

const { status, data } = await apiInstance.getSeasonRaceGuideDocs();
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

# **getSeasonSpectatorSubsessionIdsDetailDocs**
> IracingServiceMethodDocs getSeasonSpectatorSubsessionIdsDetailDocs()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

const { status, data } = await apiInstance.getSeasonSpectatorSubsessionIdsDetailDocs();
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

# **getSeasonSpectatorSubsessionIdsDocs**
> IracingServiceMethodDocs getSeasonSpectatorSubsessionIdsDocs()


### Example

```typescript
import {
    SeasonApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeasonApi(configuration);

const { status, data } = await apiInstance.getSeasonSpectatorSubsessionIdsDocs();
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

