# SeriesApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getSeries**](#getseries) | **GET** /data/series/get | |
|[**getSeriesAssets**](#getseriesassets) | **GET** /data/series/assets | |
|[**getSeriesAssetsDocs**](#getseriesassetsdocs) | **GET** /data/doc/series/assets | |
|[**getSeriesDocs**](#getseriesdocs) | **GET** /data/doc/series | |
|[**getSeriesGetDocs**](#getseriesgetdocs) | **GET** /data/doc/series/get | |
|[**getSeriesPastSeasons**](#getseriespastseasons) | **GET** /data/series/past_seasons | |
|[**getSeriesPastSeasonsDocs**](#getseriespastseasonsdocs) | **GET** /data/doc/series/past_seasons | |
|[**getSeriesSeasonList**](#getseriesseasonlist) | **GET** /data/series/season_list | |
|[**getSeriesSeasonListDocs**](#getseriesseasonlistdocs) | **GET** /data/doc/series/season_list | |
|[**getSeriesSeasonSchedule**](#getseriesseasonschedule) | **GET** /data/series/season_schedule | |
|[**getSeriesSeasonScheduleDocs**](#getseriesseasonscheduledocs) | **GET** /data/doc/series/season_schedule | |
|[**getSeriesSeasons**](#getseriesseasons) | **GET** /data/series/seasons | |
|[**getSeriesSeasonsDocs**](#getseriesseasonsdocs) | **GET** /data/doc/series/seasons | |
|[**getSeriesStatsSeries**](#getseriesstatsseries) | **GET** /data/series/stats_series | |
|[**getSeriesStatsSeriesDocs**](#getseriesstatsseriesdocs) | **GET** /data/doc/series/stats_series | |

# **getSeries**
> IracingAPIResponse getSeries()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeries();
```

### Parameters
This endpoint does not have any parameters.


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

# **getSeriesAssets**
> IracingAPIResponse getSeriesAssets()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesAssets();
```

### Parameters
This endpoint does not have any parameters.


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

# **getSeriesAssetsDocs**
> IracingServiceMethodDocs getSeriesAssetsDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesAssetsDocs();
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

# **getSeriesDocs**
> { [key: string]: IracingServiceMethodDocs; } getSeriesDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesDocs();
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

# **getSeriesGetDocs**
> IracingServiceMethodDocs getSeriesGetDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesGetDocs();
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

# **getSeriesPastSeasons**
> IracingAPIResponse getSeriesPastSeasons()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

let series_id: number; // (default to undefined)

const { status, data } = await apiInstance.getSeriesPastSeasons(
    series_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **series_id** | [**number**] |  | defaults to undefined|


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

# **getSeriesPastSeasonsDocs**
> IracingServiceMethodDocs getSeriesPastSeasonsDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesPastSeasonsDocs();
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

# **getSeriesSeasonList**
> IracingAPIResponse getSeriesSeasonList()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

let include_series: boolean; // (optional) (default to undefined)
let season_year: number; // (optional) (default to undefined)
let season_quarter: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.getSeriesSeasonList(
    include_series,
    season_year,
    season_quarter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **include_series** | [**boolean**] |  | (optional) defaults to undefined|
| **season_year** | [**number**] |  | (optional) defaults to undefined|
| **season_quarter** | [**number**] |  | (optional) defaults to undefined|


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

# **getSeriesSeasonListDocs**
> IracingServiceMethodDocs getSeriesSeasonListDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesSeasonListDocs();
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

# **getSeriesSeasonSchedule**
> IracingAPIResponse getSeriesSeasonSchedule()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

let season_id: number; // (default to undefined)

const { status, data } = await apiInstance.getSeriesSeasonSchedule(
    season_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|


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

# **getSeriesSeasonScheduleDocs**
> IracingServiceMethodDocs getSeriesSeasonScheduleDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesSeasonScheduleDocs();
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

# **getSeriesSeasons**
> IracingAPIResponse getSeriesSeasons()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

let include_series: boolean; // (optional) (default to undefined)
let season_year: number; //To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. (optional) (default to undefined)
let season_quarter: number; //To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. (optional) (default to undefined)

const { status, data } = await apiInstance.getSeriesSeasons(
    include_series,
    season_year,
    season_quarter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **include_series** | [**boolean**] |  | (optional) defaults to undefined|
| **season_year** | [**number**] | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. | (optional) defaults to undefined|
| **season_quarter** | [**number**] | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. | (optional) defaults to undefined|


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

# **getSeriesSeasonsDocs**
> IracingServiceMethodDocs getSeriesSeasonsDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesSeasonsDocs();
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

# **getSeriesStatsSeries**
> IracingAPIResponse getSeriesStatsSeries()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesStatsSeries();
```

### Parameters
This endpoint does not have any parameters.


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

# **getSeriesStatsSeriesDocs**
> IracingServiceMethodDocs getSeriesStatsSeriesDocs()


### Example

```typescript
import {
    SeriesApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.getSeriesStatsSeriesDocs();
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

